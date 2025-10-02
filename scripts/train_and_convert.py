# scripts/train_and_convert_npy.py

import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.optimizers import Adam
import random
import tensorflowjs as tfjs
import os
from sklearn.model_selection import train_test_split # Pour la validation

# --- PARAMÈTRES ---
IMAGE_SIZE = 160  # Les fichiers .npy ont 160x160. Nous allons redimensionner.
TARGET_SIZE = 128 # Taille cible pour l'entraînement du modèle
EMBEDDING_SIZE = 128 
MODEL_OUTPUT_DIR = '../public/models/fingerprint' # Dossier de sortie dans votre projet Next.js
EPOCHS = 10
BATCH_SIZE = 32
ALPHA = 0.2 # Marge pour Triplet Loss

# --- CHEMINS DES DONNÉES (À ADAPTER si nécessaire) ---
# Le script suppose qu'il est exécuté dans /scripts et que les .npy sont à côté.
# Si vous avez déjà importé les fichiers, adaptez ces chemins.
DATA_PATH = './dataset/np_data' # Exemple de dossier
X_TRAIN_PATH = 'img_train.npy' 
Y_TRAIN_PATH = 'label_train.npy'

# --- 1. CHARGEMENT ET PRÉTRAITEMENT DES DONNÉES (Basé sur .npy) ---
def load_and_preprocess_npy():
    print("Chargement des données à partir des fichiers .npy...")
    try:
        # Charger les données (les vôtres sont déjà en uint8, [N, 160, 160, 1])
        X_train_raw = np.load(X_TRAIN_PATH) # 800 images (ex: FVC2000 DB4-A)
        y_train_raw = np.load(Y_TRAIN_PATH) # 800 labels
    except FileNotFoundError:
        print(f"Erreur: Assurez-vous que les fichiers {X_TRAIN_PATH} et {Y_TRAIN_PATH} sont présents.")
        return None, None
        
    print(f"Forme des images brutes: {X_train_raw.shape}")

    # Redimensionnement (Resize) et Normalisation 
    # Le modèle Keras de TF utilise des données float32, donc on convertit et redimensionne
    X_processed = tf.image.resize(X_train_raw, [TARGET_SIZE, TARGET_SIZE]).numpy()
    X_processed = X_processed.astype('float32') / 255.0

    # Étant donné que les labels sont [N, 1], on les flatten en [N,]
    y_labels = y_train_raw.flatten()
    
    print(f"Forme des images après redimensionnement ({TARGET_SIZE}x{TARGET_SIZE}): {X_processed.shape}")
    
    # Séparer en entraînement et validation
    X_train, X_val, y_train, y_val = train_test_split(
        X_processed, y_labels, test_size=0.1, stratify=y_labels, random_state=42
    )
    
    return X_train, y_train, X_val, y_val

X_train, y_train, X_val, y_val = load_and_preprocess_npy()

if X_train is None:
    exit()

# --- 2. DÉFINITION DU MODÈLE D'EMBEDDING ---
def create_embedding_model(input_shape=(TARGET_SIZE, TARGET_SIZE, 1), embedding_size=EMBEDDING_SIZE):
    # (Le modèle CNN reste identique à la proposition précédente)
    input_layer = Input(shape=input_shape)
    
    x = Conv2D(32, (5, 5), activation='relu')(input_layer)
    x = MaxPooling2D((2, 2))(x)
    x = Conv2D(64, (3, 3), activation='relu')(x)
    x = MaxPooling2D((2, 2))(x)
    x = Conv2D(128, (3, 3), activation='relu')(x)
    x = MaxPooling2D((2, 2))(x)
    
    x = Flatten()(x)
    x = Dense(512, activation='relu')(x)
    
    embedding_layer = Dense(embedding_size, activation=None, name='embedding')(x)
    
    normalized_embedding = tf.math.l2_normalize(embedding_layer, axis=-1)
    
    model = Model(inputs=input_layer, outputs=normalized_embedding, name='FingerprintExtractor')
    return model

embedding_model = create_embedding_model()
print("\n--- Modèle d'Embedding (CNN) ---")
embedding_model.summary()

# --- 3. TRIPLET LOSS ET GÉNÉRATEUR ---
def triplet_loss(_, y_pred):
    # Triplet Loss est calculé sur la sortie des embeddings [Anchor, Positive, Negative]
    anchor = y_pred[:, 0, :]
    positive = y_pred[:, 1, :]
    negative = y_pred[:, 2, :]
    
    # Distance euclidienne au carré
    pos_dist = tf.reduce_sum(tf.square(anchor - positive), axis=-1)
    neg_dist = tf.reduce_sum(tf.square(anchor - negative), axis=-1)

    # Loss: max(0, dist(A, P) - dist(A, N) + alpha)
    loss = tf.maximum(pos_dist - neg_dist + ALPHA, 0.0)
    return tf.reduce_mean(loss)

def triplet_generator(X, y, batch_size):
    # Crée un dictionnaire d'indices pour chaque identité
    indices_by_label = {label: np.where(y == label)[0] for label in np.unique(y) if len(np.where(y == label)[0]) >= 2}
    unique_labels = list(indices_by_label.keys())
    
    while True:
        anchor_images = []
        positive_images = []
        negative_images = []
        
        for _ in range(batch_size):
            # 1. Ancre & Positive (même identité)
            anchor_label = random.choice(unique_labels)
            anchor_indices = indices_by_label[anchor_label]
            idx_a, idx_p = random.sample(list(anchor_indices), 2)

            # 2. Négative (identité différente)
            negative_label = random.choice([l for l in unique_labels if l != anchor_label])
            negative_indices = indices_by_label[negative_label]
            idx_n = random.choice(list(negative_indices))
            
            anchor_images.append(X[idx_a])
            positive_images.append(X[idx_p])
            negative_images.append(X[idx_n])
            
        A = np.array(anchor_images)
        P = np.array(positive_images)
        N = np.array(negative_images)

        # La sortie de y_true (dummy) doit correspondre à la sortie de 'merged' pour Keras
        dummy_y = np.zeros((len(A), 3, EMBEDDING_SIZE)) 

        yield [A, P, N], dummy_y

# --- 4. MODÈLE D'ENTRAÎNEMENT COMPLET ---
def create_train_model(base_model):
    anchor_in = Input(shape=(TARGET_SIZE, TARGET_SIZE, 1), name='anchor_input')
    positive_in = Input(shape=(TARGET_SIZE, TARGET_SIZE, 1), name='positive_input')
    negative_in = Input(shape=(TARGET_SIZE, TARGET_SIZE, 1), name='negative_input')
    
    # Partage de poids
    anchor_out = base_model(anchor_in)
    positive_out = base_model(positive_in)
    negative_out = base_model(negative_in)
    
    # La sortie est un tensor [N, 3, E_SIZE]
    merged = tf.stack([anchor_out, positive_out, negative_out], axis=1)
    
    train_model = Model(inputs=[anchor_in, positive_in, negative_in], outputs=merged)
    return train_model

train_model = create_train_model(embedding_model)
train_model.compile(optimizer=Adam(learning_rate=0.0001), loss=triplet_loss)

# --- 5. ENTRAÎNEMENT ---
print("\n--- Démarrage de l'entraînement (Triplet Loss) ---")

STEPS_PER_EPOCH = len(X_train) // (3 * BATCH_SIZE) # Nombre de triplets par epoch
VAL_STEPS = len(X_val) // (3 * BATCH_SIZE)

train_model.fit(
    triplet_generator(X_train, y_train, BATCH_SIZE),
    steps_per_epoch=STEPS_PER_EPOCH,
    epochs=EPOCHS,
    validation_data=triplet_generator(X_val, y_val, BATCH_SIZE),
    validation_steps=VAL_STEPS
)

# --- 6. SAUVEGARDE ET CONVERSION ---
print("\n--- Sauvegarde et conversion du modèle pour TensorFlow.js ---")

# Sauvegarder uniquement le modèle d'extraction d'embedding (sans l'architecture Triplet)
keras_model_path = 'fingerprint_extractor.h5'
embedding_model.save(keras_model_path)

# Convertir au format TensorFlow.js
try:
    os.makedirs(MODEL_OUTPUT_DIR, exist_ok=True)
    tfjs.converters.convert_tf_model(
        keras_model_path,
        output_dir=MODEL_OUTPUT_DIR,
        quantization_bytes=2
    )
    print(f"\n✅ Modèle converti et enregistré dans {MODEL_OUTPUT_DIR}")
    print("Fichiers créés: model.json et poids .bin. Vous pouvez maintenant utiliser l'API Next.js.")
except Exception as e:
    print(f"\n❌ ERREUR lors de la conversion TF.js: {e}")
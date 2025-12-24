import React from "react";
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Image,
    Font,
} from "@react-pdf/renderer";

// Définir les interfaces nécessaires (simplifiées pour la carte)
interface CitizenCardData {
    firstName: string;
    lastName: string;
    nationalityID: string;
    birthDate: string;
    birthPlace: string;
    gender: string;
    maritalStatus: string;
    // On utilise la première image si disponible
    imagePath?: string;
    nationality: string;
}

// ------------------------------------------------------------------
// 2. Définition des Styles
//    ADAPTATION AU FORMAT A7 PAYSAGE (Correspond à ID-2)
//    Dimensions A7: 74mm x 105mm
//    Pour le paysage: 105mm (largeur) x 74mm (hauteur)
//    Conversion : 1 point (pt) ≈ 0.3528 mm
// ------------------------------------------------------------------
const A7_LANDSCAPE_WIDTH_MM = 105;
const A7_LANDSCAPE_HEIGHT_MM = 74;

const A7_LANDSCAPE_WIDTH_PT = (A7_LANDSCAPE_WIDTH_MM / 25.4) * 72; // ≈ 297.6 points
const A7_LANDSCAPE_HEIGHT_PT = (A7_LANDSCAPE_HEIGHT_MM / 25.4) * 72; // ≈ 210 points

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#f0f0f0",
        padding: 0, 
        fontFamily: "Helvetica",
    },
    cardContainer: {
        // Dimensions pour A7 en orientation paysage (ID-2)
        width: A7_LANDSCAPE_WIDTH_PT,
        height: A7_LANDSCAPE_HEIGHT_PT, 
        backgroundColor: "#ffffff",
        border: "1pt solid #005A9C", // Bleu RDC
        borderRadius: 4, 
        padding: 8, // Padding ajusté pour ce format plus grand
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    },
    // Style du Filigrane (maintenant avec une image)
    watermarkImage: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1, // Très transparent
        objectFit: "contain", // L'image s'ajustera sans être coupée
        transform: "rotate(-45deg) scale(1.5)", // Rotation et zoom pour couvrir la zone
        zIndex: 0, // En dessous du contenu
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "0.5pt solid #ddd",
        paddingBottom: 3,
        marginBottom: 3,
    },
    logoText: {
        fontSize: 9, // Taille ajustée
        fontWeight: "bold",
        color: "#005A9C",
        textTransform: "uppercase",
    },
    countryText: {
        fontSize: 7, // Taille ajustée
        color: "#333",
    },
    // NOUVEAU STYLE POUR LE LOGO NATIONAL DANS L'EN-TÊTE
    nationalHeaderLogo: {
        width: 15, 
        height: 15,
        objectFit: "contain",
        borderRadius: 1, // Optionnel, pour donner un léger coin arrondi
    },
    content: {
        flexDirection: "row",
        marginTop: 5,
        flexGrow: 1,
    },
    imageContainer: {
        width: 60, 
        height: 75, 
        border: "0.5pt solid #ccc",
        borderRadius: 2,
        marginRight: 8,
        backgroundColor: "#f9f9f9",
        justifyContent: "center",
        alignItems: "center",
    },
    citizenPhoto: {
        width: "100%",
        height: "100%",
        borderRadius: 2,
        objectFit: "cover",
    },
    infoContainer: {
        flex: 1,
    },
    label: {
        fontSize: 6, 
        color: "#666",
        marginBottom: 1,
        textTransform: "uppercase",
        fontWeight: "bold",
    },
    value: {
        fontSize: 8, 
        color: "#000",
        marginBottom: 3,
        paddingBottom: 0,
        lineHeight: 1.1,
    },
    idSection: {
        marginTop: 5,
        paddingTop: 5,
        borderTop: "0.5pt solid #005A9C",
        textAlign: "center",
    },
    idLabel: {
        fontSize: 7, 
        fontWeight: "bold",
        color: "#005A9C",
    },
    idValue: {
        fontSize: 12, 
        fontWeight: "extrabold",
        letterSpacing: 0.7,
    },
});

// ------------------------------------------------------------------
// 3. Le Composant de Carte PDF
// ------------------------------------------------------------------
export const CitizenCardPDF: React.FC<{ citizen: CitizenCardData }> = ({
    citizen,
}) => {
    // Formatage de la date de naissance
    const formattedBirthDate = new Date(citizen.birthDate).toLocaleDateString(
        "fr-FR"
    );

    return (
        <Document title={`Carte Citoyen - ${citizen.lastName}`}>
            <Page size="A6" orientation="landscape" style={styles.page}>
                <View style={styles.cardContainer}>
                    {/* FILIGRANE - IMAGE DU LOGO DU CONGO EN ARRIÈRE-PLAN */}
                    <Image 
                        src="/img/logocongo.png" 
                        style={styles.watermarkImage} 
                    />

                    {/* EN-TÊTE */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.logoText}>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</Text>
                            <Text style={styles.countryText}>
                                Carte Nationale d'Identité
                            </Text>
                        </View>
                        {/* LOGO NATIONAL - REMPLACEMENT DU PLACEHOLDER VERT */}
                        <Image
                            src="/img/logodrc.jpg"
                            style={styles.nationalHeaderLogo}
                        />
                    </View>

                    {/* CONTENU PRINCIPAL */}
                    <View style={styles.content}>
                        {/* PHOTO */}
                        <View style={styles.imageContainer}>
                            {citizen.imagePath ? (
                                <Image
                                    style={styles.citizenPhoto}
                                    src={citizen.imagePath}
                                />
                            ) : (
                                <Text style={{ fontSize: 6, color: "#999" }}>Photo</Text>
                            )}
                        </View>

                        {/* INFORMATIONS */}
                        <View style={styles.infoContainer}>
                            {/* Nom */}
                            <Text style={styles.label}>Nom</Text>
                            <Text style={styles.value}>{citizen.lastName.toUpperCase()}</Text>
                            
                            {/* Prénom */}
                            <Text style={styles.label}>Prénom(s)</Text>
                            <Text style={styles.value}>{citizen.firstName}</Text>

                            {/* Naissance */}
                            <Text style={styles.label}>Né(e) le / Lieu</Text>
                            <Text style={styles.value}>
                                {formattedBirthDate} à {citizen.birthPlace}
                            </Text>
                            
                            {/* Sexe / État Civil */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <View style={{ width: "48%" }}>
                                    <Text style={styles.label}>Sexe</Text>
                                    <Text style={styles.value}>{citizen.gender}</Text>
                                </View>
                                <View style={{ width: "48%" }}>
                                    <Text style={styles.label}>Nationalité</Text>
                                    <Text style={styles.value}>{citizen.nationality}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    
                    {/* SECTION ID */}
                    <View style={styles.idSection}>
                        <Text style={styles.idLabel}>Numéro d'Identification Nationale</Text>
                        <Text style={styles.idValue}>{citizen.nationalityID}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';

// Enregistrement de la police pour éviter les avertissements (facultatif mais recommandé)
// NOTE: Vous pouvez utiliser une autre police si vous en avez une qui correspond mieux.
Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.ttf',
});

// Styles pour le document PDF
// Ces styles tentent de reproduire la mise en page du document scanné.
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  section: {
    marginTop: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontWeight: 'normal',
    color: '#555',
  },
  value: {
    width: '70%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  signatureBlock: {
    width: '45%',
    textAlign: 'center',
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 5,
  },
});

// Interface pour les données de l'acte de naissance (peut être mise à jour si nécessaire)
interface BirthRecord {
  childName: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  registrationNumber: string;
  date: string;
  parents: {
    fatherName: string;
    fatherProfession: string;
    motherName: string;
    motherProfession: string;
  };
  officiant: {
    username: string;
  };
}

// Le composant PDF qui dessine le document
const MyDocument = ({ record }: { record: BirthRecord }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerText}>REPUBLIQUE DEMOCRATIQUE DU CONGO</Text>
        <Text>Province du Sud-Kivu</Text>
        <Text>Ville de Bukavu</Text>
        <Text>Commune d'Ibanda</Text>
      </View>

      <View style={styles.header}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>ACTE DE NAISSANCE</Text>
      </View>
      
      <View style={styles.section}>
        <Text>
          L'an deux mille vingt-cinq, le vingt-deuxième jour du mois de septembre, à
          <Text style={{ borderBottomWidth: 1 }}> {new Date(record.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} </Text>
          heures,
        </Text>
        <Text style={{ marginTop: 10 }}>
          Par devant nous,
          <Text style={{ borderBottomWidth: 1 }}> {record.officiant.username} </Text>
          , Officier de l'État civil de la Commune d'Ibanda.
        </Text>
      </View>

      <View style={styles.section}>
        <Text>
          À comparu M./Mme.
          <Text style={{ borderBottomWidth: 1 }}> {record.parents.fatherName} </Text>
          , profession
          <Text style={{ borderBottomWidth: 1 }}> {record.parents.fatherProfession} </Text>
          , résidant à
          <Text style={{ borderBottomWidth: 1 }}> ... </Text>
          .
        </Text>
        <Text style={{ marginTop: 10 }}>
          Le quel (laquelle) nous a déclaré ce qui suit :
        </Text>
      </View>

      <View style={styles.section}>
        <Text>
          Le
          <Text style={{ borderBottomWidth: 1 }}> {new Date(record.birthDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} </Text>
          est né(e) à
          <Text style={{ borderBottomWidth: 1 }}> {record.birthPlace} </Text>
          , un enfant de sexe
          <Text style={{ borderBottomWidth: 1 }}> {record.gender} </Text>
          , nommé(e)
          <Text style={{ borderBottomWidth: 1 }}> {record.childName} </Text>
          .
        </Text>
        <Text style={{ marginTop: 10 }}>
          Fils (fille) de M.
          <Text style={{ borderBottomWidth: 1 }}> {record.parents.fatherName} </Text>
          , né à
          <Text style={{ borderBottomWidth: 1 }}> ... </Text>
          , nationalité
          <Text style={{ borderBottomWidth: 1 }}> ... </Text>
          , profession
          <Text style={{ borderBottomWidth: 1 }}> {record.parents.fatherProfession} </Text>
          .
        </Text>
        <Text>
          Et de M.
          <Text style={{ borderBottomWidth: 1 }}> {record.parents.motherName} </Text>
          , née à
          <Text style={{ borderBottomWidth: 1 }}> ... </Text>
          , nationalité
          <Text style={{ borderBottomWidth: 1 }}> ... </Text>
          , profession
          <Text style={{ borderBottomWidth: 1 }}> {record.parents.motherProfession} </Text>
          .
        </Text>
      </View>

      <View style={styles.section}>
        <Text>
          Fait à Bukavu, le
          <Text style={{ borderBottomWidth: 1 }}> {new Date(record.date).toLocaleDateString("fr-FR")} </Text>
          .
        </Text>
      </View>
      
      <View style={styles.signatures}>
        <View style={styles.signatureBlock}>
          <Text>Le Déclarant</Text>
        </View>
        <View style={styles.signatureBlock}>
          <Text>L'Officier de l'État civil</Text>
          <Text>{record.officiant.username}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default function Generatebirth({ birthRecord }: { birthRecord: BirthRecord }) {
  if (!birthRecord) {
    return null;
  }

  return (
    <div className="p-4 flex justify-center">
      <PDFDownloadLink
        document={<MyDocument record={birthRecord} />}
        fileName={`Acte_Naissance_${birthRecord.registrationNumber}.pdf`}
      >
        {({ loading }) => (
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Génération...' : 'Télécharger l\'Acte PDF'}
          </button>
        )}
      </PDFDownloadLink>
    </div>
  );
}

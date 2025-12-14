import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

interface ProductData {
    title: string;
    image: string;
    source: string;
    url: string;
}

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 0, // We control margins manually if needed
    },
    labelContainer: {
        height: '50%', // Exactly half page
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderBottomStyle: 'dashed',
    },
    labelContainerLast: {
        borderBottomWidth: 0,
    },
    imageSection: {
        width: '35%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 10,
    },
    image: {
        objectFit: 'contain',
        maxHeight: '100%',
        maxWidth: '100%',
        borderRadius: 4,
    },
    infoSection: {
        width: '65%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        fontFamily: 'Helvetica-Bold',
    },
    source: {
        fontSize: 10,
        color: '#666',
        textTransform: 'uppercase',
        fontFamily: 'Helvetica',
    },
});

interface LabelPdfProps {
    data: ProductData;
}

export const LabelPdf = ({ data }: LabelPdfProps) => (
    <Document>
        <Page size="LETTER" style={styles.page}>
            {/* Label 1 */}
            <View style={styles.labelContainer}>
                {data.image && (
                    <View style={styles.imageSection}>
                        {/* Note: @react-pdf Image requires CORS compatible URLs or base64. 
                Next.js dev server proxy might be needed if external images fail. 
                For now assuming the 'crossOrigin' support works or the scraping API returns base64/proxy. 
                Actually, standard URLs work if CORS allows. */}
                        <Image src={data.image} style={styles.image} />
                    </View>
                )}
                <View style={styles.infoSection}>
                    <Text style={styles.title}>{data.title}</Text>
                    <Text style={styles.source}>SOURCE: {data.source}</Text>
                </View>
            </View>

            {/* Label 2 */}
            <View style={[styles.labelContainer, styles.labelContainerLast]}>
                {data.image && (
                    <View style={styles.imageSection}>
                        <Image src={data.image} style={styles.image} />
                    </View>
                )}
                <View style={styles.infoSection}>
                    <Text style={styles.title}>{data.title}</Text>
                    <Text style={styles.source}>SOURCE: {data.source}</Text>
                </View>
            </View>
        </Page>
    </Document>
);

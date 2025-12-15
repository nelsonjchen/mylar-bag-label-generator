import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

interface ProductData {
    title: string;
    image: string;
    imageBase64?: string;
    source: string;
    url: string;
}

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 0,
    },
    labelContainer: {
        height: '50%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20, // Reduced padding
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderBottomStyle: 'dashed',
    },
    labelContainerLast: {
        borderBottomWidth: 0,
    },
    imageSection: {
        width: '40%', // Increased width for image
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 20,
    },
    image: {
        objectFit: 'contain',
        height: '100%',
        width: '100%',
    },
    infoSection: {
        width: '60%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 0,
    },
    title: {
        fontSize: 36, // Much larger title
        marginBottom: 15,
        fontFamily: 'Helvetica-Bold',
        lineHeight: 1.2,
    },
    source: {
        fontSize: 12,
        color: '#444',
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
                {(data.image || data.imageBase64) && (
                    <View style={styles.imageSection}>
                        <Image src={data.imageBase64 || data.image} style={styles.image} />
                    </View>
                )}
                <View style={styles.infoSection}>
                    <Text style={styles.title}>{data.title}</Text>
                    <Text style={styles.source}>SOURCE: {data.source}</Text>
                </View>
            </View>

            {/* Label 2 */}
            <View style={[styles.labelContainer, styles.labelContainerLast]}>
                {(data.image || data.imageBase64) && (
                    <View style={styles.imageSection}>
                        <Image src={data.imageBase64 || data.image} style={styles.image} />
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

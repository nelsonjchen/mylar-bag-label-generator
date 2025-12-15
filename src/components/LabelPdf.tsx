import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

interface ProductData {
    title: string;
    image: string;
    imageBase64?: string;
    source: string;
    url: string;
    color?: string;
    colorImage?: string;
}

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 10, // Reduced page padding
    },
    labelContainer: {
        height: '50%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5, // Minimal padding inside label
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderBottomStyle: 'dashed',
    },
    labelContainerLast: {
        borderBottomWidth: 0,
    },
    imageSection: {
        flexGrow: 1, // Take up remaining space
        height: '100%',
        paddingRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        objectFit: 'contain',
        height: '100%',
        width: '100%',
    },
    infoSection: {
        width: '28%', // Narrower text section
        height: '100%',
        justifyContent: 'center', // Center vertically
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 22,
        marginBottom: 8,
        fontFamily: 'Helvetica-Bold',
        lineHeight: 1.1,
    },
    colorContainer: {
        flexDirection: 'column', // Stack color info
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    colorText: {
        fontSize: 12,
        fontFamily: 'Helvetica',
        color: '#000',
        marginBottom: 4,
    },
    colorSwatch: {
        width: 30, // Larger swatch
        height: 30,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
        objectFit: 'cover',
    },
    source: {
        fontSize: 8,
        color: '#666',
        textTransform: 'uppercase',
        fontFamily: 'Helvetica',
        marginTop: 'auto', // Push to bottom? Or just margin
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
                    {data.color && (
                        <View style={styles.colorContainer}>
                            <Text style={styles.colorText}>Color: {data.color}</Text>
                            {data.colorImage && (
                                <Image src={data.colorImage} style={styles.colorSwatch} />
                            )}
                        </View>
                    )}
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
                    {data.color && (
                        <View style={styles.colorContainer}>
                            <Text style={styles.colorText}>Color: {data.color}</Text>
                            {data.colorImage && (
                                <Image src={data.colorImage} style={styles.colorSwatch} />
                            )}
                        </View>
                    )}
                    <Text style={styles.source}>SOURCE: {data.source}</Text>
                </View>
            </View>
        </Page>
    </Document>
);

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
        fontSize: 24, // Slightly smaller to fit color
        marginBottom: 10,
        fontFamily: 'Helvetica-Bold',
        lineHeight: 1.2,
    },
    colorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    colorText: {
        fontSize: 14,
        fontFamily: 'Helvetica',
        color: '#000',
    },
    colorSwatch: {
        width: 20,
        height: 20,
        marginLeft: 10,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
        objectFit: 'cover',
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

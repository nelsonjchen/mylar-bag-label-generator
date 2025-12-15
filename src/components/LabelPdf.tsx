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
    qrCodeBase64?: string;
}

// Create styles
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
        position: 'relative', // Enable absolute positioning for children
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderBottomStyle: 'dashed',
    },
    labelContainerLast: {
        borderBottomWidth: 0,
    },
    // The central area for the image, with margins for text
    imageContainer: {
        position: 'absolute',
        top: 35,
        bottom: 35,
        left: 45, // Shifted slightly to center the group visually
        right: 35,
        flexDirection: 'row', // Side by side
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    image: {
        flexGrow: 1, // Image takes available space
        height: '100%',
        objectFit: 'contain',
    },
    qrCode: {
        width: 100, // Much larger
        height: 100,
        backgroundColor: 'white', // Ensure it stands out
    },
    // Text blocks positioning
    textBlock: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textTop: {
        top: 5,
        left: 0,
        right: 0,
        height: 30,
        transform: 'rotate(180deg)',
    },
    textBottom: {
        bottom: 5,
        left: 0,
        right: 0,
        height: 30,
    },
    textLeft: {
        position: 'absolute',
        top: 183, // (396/2) - (30/2)
        left: -130, // 20 - (300/2)
        width: 300,
        height: 30,
        transform: 'rotate(-90deg)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textRight: {
        position: 'absolute',
        top: 183,
        right: -130,
        width: 300,
        height: 30,
        transform: 'rotate(90deg)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Typography
    textGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        width: '100%',
    },
    title: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
    colorText: {
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#444',
    },
});

interface LabelPdfProps {
    data: ProductData;
}

const TextGroup = ({ data }: { data: ProductData }) => {
    const isBambu = data.url.toLowerCase().includes('bambulab');
    return (
        <View style={styles.textGroup}>
            <Text style={styles.title}>{data.title}</Text>
            {data.color && <Text style={styles.colorText}> • {data.color}</Text>}
            {isBambu && <Text style={styles.colorText}> • Bambu Lab</Text>}
        </View>
    );
};

const LabelContent = ({ data, style }: { data: ProductData; style?: any }) => (
    <View style={[styles.labelContainer, style]}>
        {/* Central Area: Image + QR Code */}
        <View style={styles.imageContainer}>
            {(data.image || data.imageBase64) && (
                <Image src={data.imageBase64 || data.image} style={styles.image} />
            )}
            {data.qrCodeBase64 && (
                <Image src={data.qrCodeBase64} style={styles.qrCode} />
            )}
        </View>

        {/* Top Text (Rotated 180) */}
        <View style={[styles.textBlock, styles.textTop]}>
            <TextGroup data={data} />
        </View>

        {/* Bottom Text (Normal) */}
        <View style={[styles.textBlock, styles.textBottom]}>
            <TextGroup data={data} />
        </View>

        {/* Left Text (Rotated -90) */}
        <View style={styles.textLeft}>
            <TextGroup data={data} />
        </View>

        {/* Right Text (Rotated 90) */}
        <View style={styles.textRight}>
            <TextGroup data={data} />
        </View>
    </View>
);

export const LabelPdf = ({ data }: LabelPdfProps) => (
    <Document>
        <Page size="LETTER" style={styles.page}>
            <LabelContent data={data} />
            <LabelContent data={data} style={styles.labelContainerLast} />
        </Page>
    </Document>
);

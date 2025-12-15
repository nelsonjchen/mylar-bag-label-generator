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
        left: 35,
        right: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
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
        right: -130, // Mirror of left
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
        width: '100%', // Ensure it uses the full width for centering
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
    source: {
        position: 'absolute',
        bottom: 2,
        right: 5,
        fontSize: 6,
        color: '#999',
        fontFamily: 'Helvetica',
    },
});

interface LabelPdfProps {
    data: ProductData;
}

const TextGroup = ({ data }: { data: ProductData }) => (
    <View style={styles.textGroup}>
        <Text style={styles.title}>{data.title}</Text>
        {data.color && <Text style={styles.colorText}> • {data.color}</Text>}
    </View>
);

const LabelContent = ({ data, style }: { data: ProductData; style?: any }) => (
    <View style={[styles.labelContainer, style]}>
        {/* Central Image */}
        {(data.image || data.imageBase64) && (
            <View style={styles.imageContainer}>
                <Image src={data.imageBase64 || data.image} style={styles.image} />
            </View>
        )}

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

        {/* Source (Tiny, bottom right corner) */}
        <Text style={styles.source}>{data.source}</Text>
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

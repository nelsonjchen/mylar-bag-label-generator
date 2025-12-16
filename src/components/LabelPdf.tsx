import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { getFilamentWarning, extractFilamentType } from '@/data/dryingParameters';

interface ProductData {
    title: string;
    image: string;
    imageBase64?: string;
    source: string;
    url: string;
    color?: string;
    colorImage?: string;
    qrCodeBase64?: string;
    dryingTemp?: string;
    dryingDuration?: string;
    warning?: string;
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
        top: 60,
        bottom: 60,
        left: 60,
        right: 60,
        flexDirection: 'row', // Side by side
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
    },
    image: {
        flexGrow: 1, // Image takes available space
        height: '100%',
        objectFit: 'contain',
    },
    qrCode: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
    },
    rightColumn: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: 140,
        height: '100%',
        gap: 0,
    },
    // Vertical notes lines extending from QR area into bottom whitespace
    notesContainer: {
        position: 'absolute',
        top: 150, // Start below the QR code area
        bottom: 40, // Extend close to the bottom text
        right: 30,
        width: 200,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
    },
    noteLine: {
        borderLeftWidth: 0.5,
        borderLeftColor: '#999',
        borderLeftStyle: 'solid',
        height: '100%',
    },
    warningContainer: {
        marginTop: 10,
        width: '100%',
        backgroundColor: '#fff8e6',
        borderWidth: 1,
        borderColor: '#e6a800',
        borderStyle: 'solid',
        padding: 4,
        borderRadius: 3,
    },
    warningText: {
        fontSize: 7,
        fontFamily: 'Helvetica',
        color: '#8a6500',
        lineHeight: 1.3,
    },
    // Text blocks positioning
    textBlock: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textTop: {
        top: 20,
        left: 0,
        right: 0,
        height: 30,
        transform: 'rotate(180deg)',
    },
    textBottom: {
        bottom: 20,
        left: 0,
        right: 0,
        height: 30,
    },
    textLeft: {
        position: 'absolute',
        top: 183, // (396/2) - (30/2)
        left: -115, // 35 - (300/2) => Center at 35px from edge
        width: 300,
        height: 30,
        transform: 'rotate(90deg)', // Flipped to face outward
        justifyContent: 'center',
        alignItems: 'center',
    },
    textRight: {
        position: 'absolute',
        top: 183,
        right: -115, // Center at 35px from right edge
        width: 300,
        height: 30,
        transform: 'rotate(-90deg)', // Flipped to face outward
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
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
    colorText: {
        fontSize: 8,
        fontFamily: 'Helvetica',
        color: '#444',
    },
});

interface LabelPdfProps {
    data: ProductData;
    quantity?: number;
}

// ... existing code ...

const TextGroup = ({ data }: { data: ProductData }) => {
    // Check if it's a Bambu URL to decide branding display
    const isBambu = data.url?.toLowerCase().includes('bambulab') || data.url?.toLowerCase().includes('bambulab.com');

    // Determine the brand text to display
    // If it's Bambu, show "Bambu Lab"
    // If it's manual/other, show data.source (Brand) if available
    const brandName = isBambu ? 'Bambu Lab' : data.source;

    // Format drying info if available
    const dryingInfo = (data.dryingTemp && data.dryingDuration)
        ? `${data.dryingTemp} ${data.dryingDuration}`
        : '';

    return (
        <View style={styles.textGroup}>
            <Text style={styles.title}>{data.title}</Text>
            {data.color && <Text style={styles.colorText}> • {data.color}</Text>}
            {brandName && <Text style={styles.colorText}> • {brandName}</Text>}
            {dryingInfo && <Text style={styles.colorText}> • {dryingInfo}</Text>}
        </View>
    );
};

const LabelContent = ({ data, style }: { data: ProductData; style?: any }) => {
    // Determine if there's a filament warning to display
    const filamentType = extractFilamentType(data.title);
    const warning = filamentType ? getFilamentWarning(filamentType) : undefined;

    return (
        <View style={[styles.labelContainer, style]}>
            {/* Central Area: Image + QR Code */}
            <View style={styles.imageContainer}>
                {(data.image || data.imageBase64) && (
                    <Image src={data.imageBase64 || data.image} style={styles.image} />
                )}
                {/* QR Code Column */}
                <View style={styles.rightColumn}>
                    {data.qrCodeBase64 && (
                        <Image src={data.qrCodeBase64} style={styles.qrCode} />
                    )}

                    {/* Filament Warning (if applicable) */}
                    {warning && (
                        <View style={styles.warningContainer}>
                            <Text style={styles.warningText}>{warning.shortText}</Text>
                            <Text style={[styles.warningText, { marginTop: 2 }]}>{warning.fullText}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Vertical handwritten notes lines in right whitespace */}
            <View style={[styles.notesContainer, warning ? { top: 230 } : {}]}>
                <View style={styles.noteLine} />
                <View style={styles.noteLine} />
                <View style={styles.noteLine} />
                <View style={styles.noteLine} />
                <View style={styles.noteLine} />
                <View style={styles.noteLine} />
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
};

export const LabelPdf = ({ data, quantity = 2 }: LabelPdfProps) => (
    <Document>
        <Page size="LETTER" style={styles.page}>
            <LabelContent data={data} />
            {quantity === 2 && <LabelContent data={data} style={styles.labelContainerLast} />}
        </Page>
    </Document>
);

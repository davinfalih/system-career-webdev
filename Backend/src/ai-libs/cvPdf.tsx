import React from 'react';
import type { CVBuilderData } from './cvBuilder';

export async function generateCvPdfBuffer(data: CVBuilderData): Promise<Buffer> {
  const { Document, Page, Text, View, StyleSheet, renderToBuffer } = await import('@react-pdf/renderer');

  const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, color: '#1a1a1a', fontFamily: 'Helvetica' },
    name: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2, letterSpacing: 1 },
    headline: { fontSize: 11, color: '#555', marginBottom: 6 },
    contact: { fontSize: 9, color: '#666', marginBottom: 12, flexDirection: 'row' as const },
    contactItem: {},
    sectionTitle: {
      fontSize: 10, fontWeight: 'bold', color: '#1a1a1a',
      textTransform: 'uppercase' as const, letterSpacing: 1.5,
      marginTop: 14, marginBottom: 6,
      borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingBottom: 3,
    },
    text: { fontSize: 9.5, lineHeight: 1.5, color: '#333' },
    bold: { fontWeight: 'bold' as const },
  });

  const contactParts = [data.email, data.phone, data.location].filter(Boolean);

  const doc = (
    <Page style={styles.page} size="A4">
      <Text style={styles.name}>{data.name.toUpperCase()}</Text>
      {data.headline ? <Text style={styles.headline}>{data.headline}</Text> : null}
      {contactParts.length > 0 && (
        <Text style={styles.contact}>
          {contactParts.map((c, i) => (
            <Text key={i} style={styles.contactItem}>
              {i > 0 ? '  |  ' : ''}{c}
            </Text>
          ))}
        </Text>
      )}

      {data.summary ? (
        <>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <Text style={styles.text}>{data.summary}</Text>
        </>
      ) : null}

      {data.skills.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Keahlian</Text>
          <Text style={styles.text}>{data.skills.map(s => s.name).join(' · ')}</Text>
        </>
      ) : null}

      {data.education.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Pendidikan</Text>
          {data.education.map((edu, i) => (
            <View key={i} style={{ marginBottom: 4 }}>
              <Text style={styles.text}>
                <Text style={styles.bold}>
                  {[edu.degree, edu.major && `(${edu.major})`].filter(Boolean).join(' ')}
                </Text>
                {edu.school ? ` — ${edu.school}` : ''}
                {edu.endYear ? ` | ${edu.endYear}` : ''}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      {data.experiences.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Pengalaman</Text>
          {data.experiences.map((exp, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={styles.text}>
                <Text style={styles.bold}>{exp.role}</Text>
                {exp.company ? ` — ${exp.company}` : ''}
                {exp.start ? ` (${exp.start}${exp.end ? ` - ${exp.end}` : ''})` : ''}
              </Text>
              {exp.description ? <Text style={[styles.text, { marginTop: 1 }]}>{exp.description}</Text> : null}
            </View>
          ))}
        </>
      ) : null}

      {data.projects.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Proyek</Text>
          {data.projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={styles.text}>
                <Text style={styles.bold}>{proj.name}</Text>
                {proj.link ? ` — ${proj.link}` : ''}
              </Text>
              {proj.description ? <Text style={[styles.text, { marginTop: 1 }]}>{proj.description}</Text> : null}
            </View>
          ))}
        </>
      ) : null}
    </Page>
  );

  const buffer = await renderToBuffer(<Document>{doc}</Document>);
  return Buffer.from(buffer);
}

import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('cv')
  @UseGuards(JwtAuthGuard)
  async cvReport(@Req() req: any, @Res() res: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const profile = user.profile;
    let skills: string[] = [];
    let education: any[] = [];
    let experiences: any[] = [];
    let projects: any[] = [];
    try { skills = JSON.parse(profile?.skills ?? '[]'); } catch { skills = []; }
    try { education = JSON.parse(profile?.education ?? '[]'); } catch { education = []; }
    try { experiences = JSON.parse(profile?.experiences ?? '[]'); } catch { experiences = []; }
    try { projects = JSON.parse(profile?.projects ?? '[]'); } catch { projects = []; }

    const { Document, Page, Text, View, StyleSheet, renderToBuffer } = await import('@react-pdf/renderer');
    const styles = StyleSheet.create({
      page: { padding: 32, fontSize: 10, color: '#18181b', fontFamily: 'Helvetica' },
      name: { fontSize: 18, fontWeight: 'bold', color: '#c11022', marginBottom: 4 },
      contact: { color: '#52525b', marginBottom: 10 },
      sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#c11022', textTransform: 'uppercase', marginTop: 12, marginBottom: 4, borderBottom: '1 solid #e4e4e7', paddingBottom: 2 },
      text: { lineHeight: 1.6 },
    });

    const doc = (
      <Page style={styles.page} size="A4">
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.contact}>
          {[user.email, profile?.phone, profile?.location].filter(Boolean).join(' | ')}
        </Text>
        {profile?.headline ? <Text style={styles.text}>{profile.headline}</Text> : null}
        {profile?.bio ? (
          <>
            <Text style={styles.sectionTitle}>Ringkasan</Text>
            <Text style={styles.text}>{profile.bio}</Text>
          </>
        ) : null}
        {skills.length ? (
          <>
            <Text style={styles.sectionTitle}>Keahlian</Text>
            <Text style={styles.text}>{skills.join(', ')}</Text>
          </>
        ) : null}
        {education.length ? (
          <>
            <Text style={styles.sectionTitle}>Pendidikan</Text>
            {education.map((e, i) => (
              <Text key={i} style={styles.text}>
                {[e.degree, e.major ? `(${e.major})` : '', e.school, e.endYear ? `- ${e.endYear}` : ''].filter(Boolean).join(' ')}
              </Text>
            ))}
          </>
        ) : null}
        {experiences.length ? (
          <>
            <Text style={styles.sectionTitle}>Pengalaman</Text>
            {experiences.map((e, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>{e.role} - {e.company ?? ''}</Text>
                {e.description ? <Text style={styles.text}>{e.description}</Text> : null}
              </View>
            ))}
          </>
        ) : null}
        {projects.length ? (
          <>
            <Text style={styles.sectionTitle}>Proyek</Text>
            {projects.map((p, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>{p.name}</Text>
                {p.description ? <Text style={styles.text}>{p.description}</Text> : null}
              </View>
            ))}
          </>
        ) : null}
      </Page>
    );

    const { Document: D } = await import('@react-pdf/renderer');
    const buffer = await renderToBuffer(<D>{doc}</D>);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CV-${user.name.replace(/\s+/g, '-')}.pdf"`);
    res.send(Buffer.from(buffer));
  }

  @Get('tracer-study')
  @UseGuards(JwtAuthGuard)
  async tracerStudy(@Req() req: any, @Res() res: any) {
    if (req.user.role !== 'INSTITUTION' || !req.user.institutionId) {
      res.status(403).json({ error: 'Akses ditolak' });
      return;
    }
    const institution = await this.prisma.institution.findUnique({
      where: { id: req.user.institutionId },
    });

    const [records, students, applications] = await Promise.all([
      this.prisma.tracerStudyRecord.findMany({
        where: { institutionId: req.user.institutionId },
        orderBy: { year: 'asc' },
      }),
      this.prisma.user.findMany({
        where: { institutionId: req.user.institutionId, role: 'STUDENT' },
      }),
      this.prisma.application.findMany({
        where: { user: { institutionId: req.user.institutionId } },
      }),
    ]);

    const { Document, Page, Text, View, StyleSheet, renderToBuffer } = await import('@react-pdf/renderer');
    const styles = StyleSheet.create({
      page: { padding: 32, fontSize: 10, color: '#18181b', fontFamily: 'Helvetica' },
      header: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 3, borderBottomColor: '#e11d48' },
      brand: { fontSize: 18, fontWeight: 'bold', color: '#e11d48' },
      title: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
      sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#e11d48', marginTop: 16, marginBottom: 6, textTransform: 'uppercase' },
      row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
      muted: { color: '#71717a' },
      tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e4e4e7', paddingVertical: 4 },
      cell: { flex: 1 },
    });

    const doc = (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>JobMatch</Text>
          <Text style={styles.title}>Tracer Study Report</Text>
          <Text style={styles.muted}>{institution?.name ?? ''} · Dihasilkan {new Date().toLocaleDateString('id-ID')}</Text>
        </View>
        <View>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={styles.row}><Text style={styles.muted}>Total Mahasiswa Terdaftar</Text><Text>{students.length}</Text></View>
          <View style={styles.row}><Text style={styles.muted}>Total Lamaran</Text><Text>{applications.length}</Text></View>
          {records.length > 0 && (
            <>
              <View style={styles.row}><Text style={styles.muted}>Total Lulusan (terakhir)</Text><Text>{records[records.length - 1].totalGraduates}</Text></View>
              <View style={styles.row}><Text style={styles.muted}>Tingkat Serapan</Text><Text>
                {records[records.length - 1].totalGraduates > 0
                  ? Math.round(((records[records.length - 1].employed + records[records.length - 1].interned) / records[records.length - 1].totalGraduates) * 100)
                  : 0}%
              </Text></View>
            </>
          )}
        </View>
        {records.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Rekapitulasi per Tahun</Text>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={[styles.cell, { fontWeight: 'bold' }]}>Tahun</Text>
              <Text style={[styles.cell, { fontWeight: 'bold' }]}>Total</Text>
              <Text style={[styles.cell, { fontWeight: 'bold' }]}>Bekerja</Text>
              <Text style={[styles.cell, { fontWeight: 'bold' }]}>Magang</Text>
              <Text style={[styles.cell, { fontWeight: 'bold' }]}>Lanjut</Text>
              <Text style={[styles.cell, { fontWeight: 'bold' }]}>Serapan</Text>
            </View>
            {records.map((r) => (
              <View key={r.id} style={styles.tableRow}>
                <Text style={styles.cell}>{r.year}</Text>
                <Text style={styles.cell}>{r.totalGraduates}</Text>
                <Text style={styles.cell}>{r.employed}</Text>
                <Text style={styles.cell}>{r.interned}</Text>
                <Text style={styles.cell}>{r.continueStudy}</Text>
                <Text style={styles.cell}>{r.totalGraduates ? Math.round(((r.employed + r.interned) / r.totalGraduates) * 100) : 0}%</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.sectionTitle}>Statistik Lamaran Mahasiswa</Text>
        <View style={styles.row}><Text style={styles.muted}>Diterima</Text><Text>{applications.filter((a) => a.status === 'ACCEPTED').length}</Text></View>
        <View style={styles.row}><Text style={styles.muted}>Interview</Text><Text>{applications.filter((a) => a.status === 'INTERVIEW').length}</Text></View>
        <View style={styles.row}><Text style={styles.muted}>Dalam Proses</Text><Text>{applications.filter((a) => ['SUBMITTED', 'UNDER_REVIEW', 'SCREENING'].includes(a.status)).length}</Text></View>
      </Page>
    );

    const buffer = await renderToBuffer(<Document>{doc}</Document>);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Tracer-Study-${institution?.name?.replace(/\s+/g, '-') ?? 'Report'}.pdf"`);
    res.send(Buffer.from(buffer));
  }
}

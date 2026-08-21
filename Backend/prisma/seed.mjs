import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_MASTER = JSON.parse(
  readFileSync(join(__dirname, "../src/ai-libs/skills-data.json"), "utf-8")
);

const prisma = new PrismaClient();

const pw = async () => bcrypt.hash("password123", 10);

const jobFactory = (companyId, overrides) => ({
  companyId,
  mustHaveSkills: "[]",
  niceToHaveSkills: "[]",
  status: "OPEN",
  forFreshGrads: true,
  ...overrides,
});

async function main() {
  console.log("Seeding database...");
  await prisma.tracerStudyRecord.deleteMany();
  await prisma.application.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.cV.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();  await prisma.institution.deleteMany();

  for (const s of SKILL_MASTER) {
    await prisma.skill.create({
      data: { name: s.name, category: s.category, demand: 40 + Math.floor(Math.random() * 55) },
    });
  }

  const institutions = [];
  const institutionData = [
    { name: "Universitas Gadjah Mada", type: "UNIVERSITY", city: "Yogyakarta" },
    { name: "Institut Teknologi Bandung", type: "UNIVERSITY", city: "Bandung" },
    { name: "Universitas Indonesia", type: "UNIVERSITY", city: "Jakarta" },
    { name: "Politeknik Negeri Jakarta", type: "POLYTECHNIC", city: "Jakarta" },
    { name: "SMK Negeri 1 Jakarta", type: "SMK", city: "Jakarta" },
    { name: "SMK Telkom Jakarta", type: "SMK", city: "Jakarta" },
    { name: "SMK Nusa Bangsa Bandung", type: "SMK", city: "Bandung" },
  ];
  for (const inst of institutionData) {
    institutions.push(await prisma.institution.create({ data: inst }));
  }

  const companies = [];
  const companyData = [
    { name: "Nusantara Tech", slug: "nusantara-tech", industry: "Teknologi", location: "Jakarta", description: "Perusahaan teknologi yang membangun produk digital untuk pendidikan dan UMKM Indonesia." },
    { name: "Kreativa Studio", slug: "kreativa-studio", industry: "Desain & Kreatif", location: "Bandung", description: "Digital creative agency yang fokus pada branding dan desain produk." },
    { name: "DataPrime Analytics", slug: "dataprime-analytics", industry: "Data & Analitik", location: "Jakarta", description: "Konsultan analitik data untuk perusahaan ritel dan keuangan." },
    { name: "GoKarya", slug: "gokarya", industry: "On-Demand Services", location: "Jakarta", description: "Platform layanan on-demand dengan ekosistem mitra terbesar di Indonesia." },
    { name: "Finora Digital", slug: "finora-digital", industry: "Fintech", location: "Jakarta", description: "Startup fintech yang menyediakan layanan pembayaran digital." },
    { name: "Sari Nusantara Group", slug: "sari-nusantara", industry: "FMCG", location: "Surabaya", description: "Grup perusahaan manufaktur dan distribusi produk konsumen." },
  ];
  for (const c of companyData) {
    companies.push(await prisma.company.create({ data: { ...c, verified: true } }));
  }

  const jobs = [];
  const jobData = [
    {
      company: "nusantara-tech",
      title: "Front-End Developer Intern",
      type: "INTERNSHIP", mode: "HYBRID", location: "Jakarta", salary: "Rp 2.500.000",
      description: "Bergabunglah dengan tim product kami untuk membangun antarmuka web modern. Kamu akan belajar bekerja dengan React, Next.js dan Tailwind CSS bersama mentor senior.",
      mustHave: ["HTML", "CSS", "JavaScript"], niceHave: ["React", "Git"],
      majorRequired: "Teknik Informatika", minGpa: 3.0,
    },
    {
      company: "nusantara-tech",
      title: "Back-End Developer (Entry Level)",
      type: "FULL_TIME", mode: "REMOTE", location: "Remote", salary: "Rp 6.000.000",
      description: "Bangun API dan layanan backend yang scalable. Kami mencari lulusan baru dengan passion di Node.js dan database.",
      mustHave: ["Node.js", "SQL"], niceHave: ["Docker", "MongoDB"],
      majorRequired: "Teknik Informatika", minGpa: 3.0,
    },
    {
      company: "kreativa-studio",
      title: "UI/UX Designer Intern",
      type: "INTERNSHIP", mode: "ONSITE", location: "Bandung", salary: "Rp 2.000.000",
      description: "Belajar mendesain produk digital dari riset hingga high-fidelity prototype menggunakan Figma.",
      mustHave: ["Figma", "UI/UX Design"], niceHave: ["Adobe Photoshop", "CSS"],
      majorRequired: "Desain Komunikasi Visual",
    },
    {
      company: "dataprime-analytics",
      title: "Junior Data Analyst",
      type: "FULL_TIME", mode: "HYBRID", location: "Jakarta", salary: "Rp 7.000.000",
      description: "Analisis data bisnis klien, buat dashboard dan laporan berkala. Cocok untuk fresh graduate statistik atau informatika.",
      mustHave: ["SQL", "Excel", "Data Analysis"], niceHave: ["Data Visualization", "Python"],
      majorRequired: "Statistika", minGpa: 3.2,
    },
    {
      company: "gokarya",
      title: "Mobile Developer Intern (Flutter)",
      type: "INTERNSHIP", mode: "ONSITE", location: "Jakarta", salary: "Rp 3.000.000",
      description: "Ikut mengembangkan aplikasi mobile dengan jutaan pengguna. Pengalaman menulis kode Dart/Flutter adalah nilai plus.",
      mustHave: ["Flutter"], niceHave: ["Java", "Git"],
    },
    {
      company: "finora-digital",
      title: "Digital Marketing Specialist",
      type: "PART_TIME", mode: "REMOTE", location: "Remote", salary: "Rp 4.000.000",
      description: "Kelola kampanye digital dan konten media sosial untuk brand fintech kami. Fresh graduate sangat dipersilakan.",
      mustHave: ["Digital Marketing"], niceHave: ["Copywriting", "Social Media Management"],
    },
    {
      company: "sari-nusantara",
      title: "Staff Akuntansi (Fresh Graduate)",
      type: "FULL_TIME", mode: "ONSITE", location: "Surabaya", salary: "Rp 5.000.000",
      description: "Membantu proses pembukuan dan pelaporan keuangan perusahaan. Dibimbing langsung oleh supervisor keuangan.",
      mustHave: ["Accountancy", "Excel"], niceHave: ["Finance"],
      majorRequired: "Akuntansi",
    },
    {
      company: "kreativa-studio",
      title: "Graphic Designer Intern",
      type: "INTERNSHIP", mode: "ONSITE", location: "Bandung", salary: "Rp 1.800.000",
      description: "Buat aset visual untuk campaign klien: poster, banner, hingga media sosial. Dilatih untuk lulusan SMK Desain.",
      mustHave: ["Adobe Illustrator", "Adobe Photoshop"], niceHave: ["Creativity", "Figma"],
      majorRequired: "Desain Komunikasi Visual",
    },
  ];

  for (const j of jobData) {
    const company = companies.find((c) => c.slug === j.company);
    const job = await prisma.job.create({
      data: jobFactory(company.id, {
        title: j.title,
        type: j.type,
        mode: j.mode,
        location: j.location,
        salary: j.salary,
        description: j.description,
        mustHaveSkills: JSON.stringify(j.mustHave),
        niceToHaveSkills: JSON.stringify(j.niceHave),
        majorRequired: j.majorRequired ?? null,
        minGpa: j.minGpa ?? null,
        deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      }),
    });
    jobs.push(job);
  }

  const hashed = await pw();
  const adminUser = await prisma.user.create({
    data: { name: "Super Admin", email: "admin@jobmatch.id", passwordHash: hashed, role: "ADMIN", verified: true },
  });

  const institutionUsers = [];
  for (let i = 0; i < institutions.length; i++) {
    const inst = institutions[i];
    const u = await prisma.user.create({
      data: {
        name: `Admin ${inst.name}`,
        email: `admin@${inst.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.id`,
        passwordHash: hashed,
        role: "INSTITUTION",
        institutionId: inst.id,
        verified: true,
      },
    });
    institutionUsers.push(u);
  }

  const companyUsers = [];
  for (const c of companies) {
    const u = await prisma.user.create({
      data: {
        name: `HRD ${c.name}`,
        email: `hrd@${c.slug}.com`,
        passwordHash: hashed,
        role: "COMPANY",
        companyId: c.id,
        verified: true,
      },
    });
    companyUsers.push(u);
  }

  const students = [];
  const studentData = [
    { name: "Budi Santoso", email: "student@career.com", institution: "Universitas Gadjah Mada", major: "Teknik Informatika", gpa: 3.6, grad: 2026, nim: "21/123456/PA/10001", skills: ["JavaScript", "React", "HTML", "CSS", "Git", "TypeScript"] },
    { name: "Siti Rahma", email: "siti@career.com", institution: "SMK Negeri 1 Jakarta", major: "Rekayasa Perangkat Lunak", gpa: 3.8, grad: 2026, nim: "12345678", skills: ["HTML", "CSS", "Figma", "JavaScript"] },
    { name: "Andi Wijaya", email: "andi@career.com", institution: "Universitas Indonesia", major: "Statistika", gpa: 3.4, grad: 2026, nim: "2101234567", skills: ["SQL", "Excel", "Data Analysis", "Python"] },
    { name: "Dewi Lestari", email: "dewi@career.com", institution: "Politeknik Negeri Jakarta", major: "Akuntansi", gpa: 3.5, grad: 2026, nim: "3322114455", skills: ["Accountancy", "Excel", "Attention to Detail"] },
  ];

  for (const s of studentData) {
    const inst = institutions.find((i) => i.name === s.institution);
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        passwordHash: hashed,
        role: "STUDENT",
        nim: s.nim,
        graduationYear: s.grad,
        gpa: s.gpa,
        major: s.major,
        institutionId: inst.id,
        verified: true,
      },
    });
    students.push(user);

    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        headline: `${s.major} Student`,
        location: inst.city,
        skills: JSON.stringify(s.skills),
        education: JSON.stringify([{ school: inst.name, degree: s.major, major: s.major, startYear: s.grad - 4, endYear: s.grad }]),
        completed: true,
        cvScore: 75 + Math.floor(Math.random() * 15),
        atsScore: 65 + Math.floor(Math.random() * 25),
      },
    });

    for (const skillName of s.skills) {
      const skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (skill) {
        await prisma.userSkill.create({
          data: { userId: user.id, skillId: skill.id, level: 3 + Math.floor(Math.random() * 2) },
        });
      }
    }
  }

  const statuses = ["SUBMITTED", "UNDER_REVIEW", "SCREENING", "INTERVIEW", "ACCEPTED", "REJECTED"];
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const job = jobs[i % jobs.length];
    const match = 70 + Math.floor(Math.random() * 25);
    await prisma.application.create({
      data: {
        userId: student.id,
        jobId: job.id,
        status: statuses[Math.min(i, statuses.length - 1)],
        matchScore: match,
      },
    });
    await prisma.notification.create({
      data: {
        userId: student.id,
        title: "Lamaran Terkirim",
        message: `Lamaranmu untuk posisi ${job.title} telah terkirim.`,
      },
    });
  }

  await prisma.bookmark.create({
    data: { userId: students[0].id, jobId: jobs[1].id },
  });
  await prisma.bookmark.create({
    data: { userId: students[0].id, jobId: jobs[2].id },
  });

  for (const inst of institutions) {
    const total = 180 + Math.floor(Math.random() * 120);
    await prisma.tracerStudyRecord.create({
      data: {
        institutionId: inst.id,
        year: 2025,
        totalGraduates: total,
        employed: Math.floor(total * 0.5),
        interned: Math.floor(total * 0.2),
        continueStudy: Math.floor(total * 0.15),
        unemployed: Math.floor(total * 0.1),
        averageIncome: "Rp 4.500.000",
      },
    });
  }

  await prisma.interview.create({
    data: {
      applicationId: (await prisma.application.findFirst({ where: { userId: students[3].id } })).id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      link: "https://meet.google.com/demo-career",
      notes: "Interview dengan tim HR - siapkan portofolio.",
    },
  });

  console.log("Seeding complete!");
  console.log("Login accounts (password: password123):");
  console.log("  Student:  student@career.com");
  console.log("  Company:  hrd@nusantara-tech.com");
  console.log("  Institution: admin@smknegeri1jakarta.id");
  console.log("  Admin:    admin@jobmatch.id");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

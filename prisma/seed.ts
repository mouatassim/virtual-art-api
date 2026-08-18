import { PrismaClient } from "../src/generated/prisma";
import { hashPassword } from "../src/utils/hash";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Seed skipped in production.");
    return;
  }

  const { hash, salt } = hashPassword("Dev@1234567890!");

  const user = await prisma.user.upsert({
    where: { email: "demo@virtual-art.app" },
    update: {
      firstName: "Musée",
      lastName: "du Louvre",
      bio: "Les collections du Louvre couvrent plus de 9 000 ans d'histoire de l'art.",
      website: "https://www.louvre.fr",
      contact: "contact@louvre.fr",
    },
    create: {
      email: "demo@virtual-art.app",
      firstName: "Musée",
      lastName: "du Louvre",
      hashedPassword: `${salt}:${hash}`,
      isActive: true,
      bio: "Les collections du Louvre couvrent plus de 9 000 ans d'histoire de l'art.",
      website: "https://www.louvre.fr",
      contact: "contact@louvre.fr",
    },
  });

  console.log(`Demo user: ${user.email}`);

  const expoFields = {
    title: "Le Louvre",
    subtitle: "Chefs-d'œuvre des collections",
    isPublished: true,
    roomWidth: 28,
    roomDepth: 18,
    roomHeight: 5,
    partitionLength: 10,
    partitionThickness: 0.3,
    partitionHeight: 4,
    wallColor: "#f0ece4",
    floorColor: "#7a6e62",
    ceilingColor: "#e8e4dc",
    floorGloss: 0.45,
    spawnX: 0,
    spawnZ: 7.5,
    spawnHeading: 0,
    eyeHeight: 1.68,
    tourDwell: 10,
    frameColor: "#2a2419",
    frameWidth: 0.055,
    frameDepth: 0.06,
    frameMat: 0.09,
    frameMetalness: 0.15,
    frameRoughness: 0.5,
  };

  let expo = await prisma.expo.findFirst({ where: { userId: user.id } });
  if (!expo) {
    expo = await prisma.expo.create({ data: { userId: user.id, ...expoFields } });
    console.log(`Expo created (id: ${expo.id})`);
  } else {
    expo = await prisma.expo.update({ where: { id: expo.id }, data: expoFields });
    console.log(`Expo updated (id: ${expo.id})`);
  }

  // Always re-seed artworks so URLs / layout stay up to date
  await prisma.artwork.deleteMany({ where: { expoId: expo.id } });

  // ── Paintings (11 masterpieces — images verified 1280 px Wikimedia) ───────────

  const paintings = [
    // CENTER_SOUTH (partition facing entrance) — the first thing visitors see
    {
      slug: "mona-lisa",
      title: "Mona Lisa",
      artist: "Léonard de Vinci",
      year: "c. 1503–1519",
      medium: "Huile sur panneau de peuplier",
      dimensions: "77 × 53 cm",
      description:
        "Le portrait le plus célèbre du monde. Le sourire énigmatique de Lisa Gherardini et son regard qui suit le visiteur restent un mystère depuis plus de cinq siècles.",
      link: "https://en.wikipedia.org/wiki/Mona_Lisa",
      wall: "CENTER_SOUTH" as const,
      offset: 0,
      width: 0.77,
      height: 1.0,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/1280px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
      sortOrder: 1,
    },

    // CENTER_NORTH (back of partition)
    {
      slug: "virgin-of-the-rocks",
      title: "La Vierge aux rochers",
      artist: "Léonard de Vinci",
      year: "c. 1483–1486",
      medium: "Huile sur panneau de bois transposée sur toile",
      dimensions: "198 × 123 cm",
      description:
        "La Vierge, l'Enfant Jésus, saint Jean-Baptiste et un ange dans un paysage rocheux. Le clair-obscur de Léonard enveloppe les personnages d'une atmosphère mystérieuse.",
      link: "https://en.wikipedia.org/wiki/Virgin_of_the_Rocks",
      wall: "CENTER_NORTH" as const,
      offset: 0,
      width: 1.23,
      height: 1.98,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Leonardo_Da_Vinci_-_Vergine_delle_Rocce_%28Louvre%29.jpg/1280px-Leonardo_Da_Vinci_-_Vergine_delle_Rocce_%28Louvre%29.jpg",
      sortOrder: 2,
    },

    // NORTH wall — panoramas monumentaux
    {
      slug: "coronation-of-napoleon",
      title: "Le Sacre de Napoléon",
      artist: "Jacques-Louis David",
      year: "1805–1807",
      medium: "Huile sur toile",
      dimensions: "621 × 979 cm",
      description:
        "David immortalise le moment où Napoléon couronne Joséphine dans Notre-Dame de Paris le 2 décembre 1804. Plus de 200 personnages historiques identifiables composent cette fresque politique.",
      link: "https://en.wikipedia.org/wiki/The_Coronation_of_Napoleon",
      wall: "NORTH" as const,
      offset: 0,
      width: 5.0,
      height: 3.2,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg/1280px-Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg",
      sortOrder: 3,
    },
    {
      slug: "raft-of-the-medusa",
      title: "Le Radeau de la Méduse",
      artist: "Théodore Géricault",
      year: "1818–1819",
      medium: "Huile sur toile",
      dimensions: "491 × 716 cm",
      description:
        "Naufrage du Méduse en 1816 : sur un radeau de fortune, les survivants — parmi lesquels des morts et des mourants — agitent des tissus vers un navire à l'horizon. Chef-d'œuvre romantique et charge politique contre la monarchie.",
      link: "https://en.wikipedia.org/wiki/The_Raft_of_the_Medusa",
      wall: "NORTH" as const,
      offset: -8,
      width: 3.5,
      height: 2.4,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/JEAN_LOUIS_TH%C3%89ODORE_G%C3%89RICAULT_-_La_Balsa_de_la_Medusa_%28Museo_del_Louvre%2C_1818-19%29.jpg/1280px-JEAN_LOUIS_TH%C3%89ODORE_G%C3%89RICAULT_-_La_Balsa_de_la_Medusa_%28Museo_del_Louvre%2C_1818-19%29.jpg",
      sortOrder: 4,
    },
    {
      slug: "wedding-at-cana",
      title: "Les Noces de Cana",
      artist: "Paolo Véronèse",
      year: "1563",
      medium: "Huile sur toile",
      dimensions: "677 × 994 cm",
      description:
        "Le miracle de Cana transposé dans la Venise de la Renaissance. La plus grande toile du Louvre : 130 personnages dont Titien, Michel-Ange et Véronèse lui-même aux instruments de musique.",
      link: "https://en.wikipedia.org/wiki/The_Wedding_at_Cana",
      wall: "NORTH" as const,
      offset: 8,
      width: 3.5,
      height: 2.4,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Paolo_Veronese_008.jpg/1280px-Paolo_Veronese_008.jpg",
      sortOrder: 5,
    },

    // EAST wall
    {
      slug: "liberty-leading-the-people",
      title: "La Liberté guidant le peuple",
      artist: "Eugène Delacroix",
      year: "1830",
      medium: "Huile sur toile",
      dimensions: "260 × 325 cm",
      description:
        "Marianne, figure allégorique de la République, brandit le drapeau tricolore sur les barricades de juillet 1830. L'une des images les plus reproduites au monde et symbole universel des libertés.",
      link: "https://en.wikipedia.org/wiki/Liberty_Leading_the_People",
      wall: "EAST" as const,
      offset: 2.5,
      width: 2.0,
      height: 1.6,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/La_Libert%C3%A9_guidant_le_peuple_-_Eug%C3%A8ne_Delacroix_-_Mus%C3%A9e_du_Louvre_Peintures_RF_129_-_apr%C3%A8s_restauration_2024.jpg/1280px-La_Libert%C3%A9_guidant_le_peuple_-_Eug%C3%A8ne_Delacroix_-_Mus%C3%A9e_du_Louvre_Peintures_RF_129_-_apr%C3%A8s_restauration_2024.jpg",
      sortOrder: 6,
    },
    {
      slug: "grande-odalisque",
      title: "La Grande Odalisque",
      artist: "Jean-Auguste-Dominique Ingres",
      year: "1814",
      medium: "Huile sur toile",
      dimensions: "91 × 162 cm",
      description:
        "Une odalisque nue au regard froid, au dos anormalement allongé. Ingres sacrifie l'anatomie à l'élégance formelle, anticipant le symbolisme et l'Art nouveau.",
      link: "https://en.wikipedia.org/wiki/Grande_Odalisque",
      wall: "EAST" as const,
      offset: -3.5,
      width: 1.62,
      height: 0.91,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/La_grande_odalisque_-_Jean-Auguste_Dominique_Ingres_-_Mus%C3%A9e_du_Louvre_Peintures_RF_1158.jpg/1280px-La_grande_odalisque_-_Jean-Auguste_Dominique_Ingres_-_Mus%C3%A9e_du_Louvre_Peintures_RF_1158.jpg",
      sortOrder: 7,
    },
    {
      slug: "the-lacemaker",
      title: "La Dentellière",
      artist: "Johannes Vermeer",
      year: "c. 1669–1670",
      medium: "Huile sur toile marouflée sur bois",
      dimensions: "24 × 21 cm",
      description:
        "Le tableau le plus petit mais l'un des plus précieux du Louvre. Vermeer rend avec une touche grasse et lumineuse la concentration absolue d'une jeune femme à son ouvrage.",
      link: "https://en.wikipedia.org/wiki/The_Lacemaker_(Vermeer)",
      wall: "EAST" as const,
      offset: 6,
      width: 0.5,
      height: 0.6,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Johannes_Vermeer_-_The_lacemaker_%28c.1669-1671%29.jpg/1280px-Johannes_Vermeer_-_The_lacemaker_%28c.1669-1671%29.jpg",
      sortOrder: 8,
    },

    // WEST wall
    {
      slug: "oath-of-the-horatii",
      title: "Le Serment des Horaces",
      artist: "Jacques-Louis David",
      year: "1784",
      medium: "Huile sur toile",
      dimensions: "330 × 425 cm",
      description:
        "Trois frères romains lèvent le bras vers les épées que leur tend leur père, jurant de combattre pour Rome. Manifeste néoclassique et prélude pictural à la Révolution française.",
      link: "https://en.wikipedia.org/wiki/Oath_of_the_Horatii",
      wall: "WEST" as const,
      offset: -2,
      width: 2.5,
      height: 2.0,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Le_Serment_des_Horaces_-_Jacques-Louis_David_-_Mus%C3%A9e_du_Louvre_Peintures_INV_3692_%3B_MR_1432.jpg/1280px-Le_Serment_des_Horaces_-_Jacques-Louis_David_-_Mus%C3%A9e_du_Louvre_Peintures_INV_3692_%3B_MR_1432.jpg",
      sortOrder: 9,
    },
    {
      slug: "death-of-sardanapalus",
      title: "La Mort de Sardanapale",
      artist: "Eugène Delacroix",
      year: "1827",
      medium: "Huile sur toile",
      dimensions: "392 × 496 cm",
      description:
        "Le roi assyrien Sardanapale ordonne, sur son lit de mort, la destruction de ses femmes, esclaves et chevaux. Tourbillon de chairs et d'étoffes — le manifeste du romantisme.",
      link: "https://en.wikipedia.org/wiki/The_Death_of_Sardanapalus",
      wall: "WEST" as const,
      offset: 4.5,
      width: 2.4,
      height: 1.9,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/La_Mort_de_Sardanapale_-_Eug%C3%A8ne_Delacroix_-_Mus%C3%A9e_du_Louvre_Peintures_RF_2346.jpg/1280px-La_Mort_de_Sardanapale_-_Eug%C3%A8ne_Delacroix_-_Mus%C3%A9e_du_Louvre_Peintures_RF_2346.jpg",
      sortOrder: 10,
    },
    {
      slug: "card-sharp-ace-diamonds",
      title: "Le Tricheur à l'as de carreau",
      artist: "Georges de La Tour",
      year: "c. 1635–1640",
      medium: "Huile sur toile",
      dimensions: "106 × 146 cm",
      description:
        "Un joueur dissimule un as dans son dos pendant qu'une servante et une courtisane complices distraient leur victime. La Tour saisit le vice dans une lumière caravagesque sobre et sévère.",
      link: "https://en.wikipedia.org/wiki/The_Cheat_with_the_Ace_of_Diamonds",
      wall: "WEST" as const,
      offset: -6,
      width: 1.46,
      height: 1.06,
      imageUrl:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Le_Tricheur_%C3%A0_l%27as_de_carreau_-_Georges_de_La_Tour_-_Mus%C3%A9e_du_Louvre_Peintures_RF_1972_8.jpg/1280px-Le_Tricheur_%C3%A0_l%27as_de_carreau_-_Georges_de_La_Tour_-_Mus%C3%A9e_du_Louvre_Peintures_RF_1972_8.jpg",
      sortOrder: 11,
    },
  ];

  for (const p of paintings) {
    await prisma.artwork.create({
      data: { expoId: expo.id, type: "PAINTING", ...p },
    });
  }
  console.log(`Created ${paintings.length} paintings.`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

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

  const artworkCount = await prisma.artwork.count({ where: { expoId: expo.id } });
  if (artworkCount > 0) {
    console.log(`Artworks already seeded (${artworkCount}). Skipping.`);
    console.log("Seed complete.");
    return;
  }

  // ── Paintings ────────────────────────────────────────────────────────────────

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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/402px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Leonardo_da_Vinci_-_Virgin_of_the_Rocks_%28Louvre%29.jpg/509px-Leonardo_da_Vinci_-_Virgin_of_the_Rocks_%28Louvre%29.jpg",
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281807%29.jpg/1200px-Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281807%29.jpg",
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/JEAN_LOUIS_TH%C3%89ODORE_G%C3%89RICAULT_-_La_Balsa_de_la_Medusa_%28Museo_del_Louvre%2C_1818-19%29.jpg/1200px-JEAN_LOUIS_TH%C3%89ODORE_G%C3%89RICAULT_-_La_Balsa_de_la_Medusa_%28Museo_del_Louvre%2C_1818-19%29.jpg",
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Paolo_Veronese_006.jpg/1200px-Paolo_Veronese_006.jpg",
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg/1024px-Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg",
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Jean_Auguste_Dominique_Ingres%2C_La_Grande_Odalisque%2C_1814.jpg/1024px-Jean_Auguste_Dominique_Ingres%2C_La_Grande_Odalisque%2C_1814.jpg",
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/De_Kantwerkster_%28Vermeer%29.jpg/452px-De_Kantwerkster_%28Vermeer%29.jpg",
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/David_Oath_of_the_Horatii.jpg/1200px-David_Oath_of_the_Horatii.jpg",
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Eug%C3%A8ne_Delacroix_-_La_Mort_de_Sardanapale.jpg/1200px-Eug%C3%A8ne_Delacroix_-_La_Mort_de_Sardanapale.jpg",
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
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/De_La_Tour_Triches.jpg/1200px-De_La_Tour_Triches.jpg",
      sortOrder: 11,
    },
  ];

  for (const p of paintings) {
    await prisma.artwork.create({
      data: { expoId: expo.id, type: "PAINTING", ...p },
    });
  }
  console.log(`Created ${paintings.length} paintings.`);

  // ── Sculptures ───────────────────────────────────────────────────────────────

  const marble = { materialColor: "#e8e3db", materialMetalness: 0.0, materialRoughness: 0.65 };
  const marbleGrey = { materialColor: "#c8c2b8", materialMetalness: 0.0, materialRoughness: 0.75 };
  const basalt = { materialColor: "#2c2825", materialMetalness: 0.05, materialRoughness: 0.9 };
  const limestone = { materialColor: "#c4a87e", materialMetalness: 0.0, materialRoughness: 0.8 };
  const alabaster = { materialColor: "#d6c8a4", materialMetalness: 0.0, materialRoughness: 0.75 };

  const sculptures = [
    // South half — between entrance and partition
    {
      slug: "psyche-revived",
      title: "Psyché ranimée par le baiser de l'Amour",
      artist: "Antonio Canova",
      year: "1787–1793",
      medium: "Marbre de Carrare",
      dimensions: "155 × 168 cm",
      description:
        "Cupidon embrasse Psyché inconsciente. Canova atteint ici le sommet du néoclassicisme : la froideur du marbre transcendée par la tendresse du mouvement.",
      link: "https://en.wikipedia.org/wiki/Psyche_Revived_by_Cupid%27s_Kiss",
      positionX: -4,
      positionZ: 4,
      shape: "SPHERES" as const,
      scale: 1.1,
      ...marble,
      plinthWidth: 0.9,
      plinthHeight: 1.0,
      sortOrder: 12,
    },
    {
      slug: "dying-slave",
      title: "L'Esclave mourant",
      artist: "Michel-Ange",
      year: "1513–1516",
      medium: "Marbre",
      dimensions: "229 cm (hauteur)",
      description:
        "L'une des deux sculptures non finies destinées au tombeau de Jules II. Le corps s'abandonne dans la mort avec une sérénité presque sensuelle — le non-finito de Michel-Ange à son plus puissant.",
      link: "https://en.wikipedia.org/wiki/Dying_Slave",
      positionX: 4,
      positionZ: 4,
      shape: "KNOT" as const,
      scale: 1.2,
      ...marble,
      plinthWidth: 0.75,
      plinthHeight: 0.9,
      sortOrder: 13,
    },

    // North half — beyond the partition
    {
      slug: "venus-de-milo",
      title: "Vénus de Milo",
      artist: "Alexandros d'Antioche",
      year: "c. 150–125 av. J.-C.",
      medium: "Marbre de Paros",
      dimensions: "204 cm (hauteur)",
      description:
        "Découverte en 1820 sur l'île de Milos, cette Aphrodite manque les deux bras depuis sa découverte. Idéal de beauté féminine antique, elle est l'une des sculptures les plus reconnaissables au monde.",
      link: "https://en.wikipedia.org/wiki/Venus_de_Milo",
      positionX: -4,
      positionZ: -4,
      shape: "MONOLITH" as const,
      scale: 1.1,
      ...marble,
      plinthWidth: 0.75,
      plinthHeight: 1.1,
      sortOrder: 14,
    },
    {
      slug: "winged-victory",
      title: "La Victoire de Samothrace",
      artist: "Anonyme",
      year: "c. 190 av. J.-C.",
      medium: "Marbre de Paros",
      dimensions: "328 cm (hauteur avec socle)",
      description:
        "Niké, déesse de la victoire, en plein vol sur la proue d'un navire. Sans tête ni bras, elle dégage une puissance dynamique inégalée dans la sculpture hellénistique.",
      link: "https://en.wikipedia.org/wiki/Winged_Victory_of_Samothrace",
      positionX: 4,
      positionZ: -4,
      shape: "MONOLITH" as const,
      scale: 1.3,
      ...marbleGrey,
      plinthWidth: 1.0,
      plinthHeight: 1.0,
      sortOrder: 15,
    },

    // Along the walls
    {
      slug: "lamassu",
      title: "Lamassu de Khorsabad",
      artist: "Anonyme (Assyrie)",
      year: "c. 713–716 av. J.-C.",
      medium: "Albâtre gypseux",
      dimensions: "420 × 440 cm",
      description:
        "Génie protecteur à corps de taureau, ailes d'aigle et tête humaine coiffée d'une tiare. Ces colosses flanquaient les portes du palais de Sargon II à Dur-Sharrukin. Cinq pattes permettent de le voir marchant de face comme de profil.",
      link: "https://en.wikipedia.org/wiki/Lamassu",
      positionX: -11,
      positionZ: 0,
      shape: "MONOLITH" as const,
      scale: 1.6,
      ...alabaster,
      plinthWidth: 1.2,
      plinthHeight: 0.3,
      sortOrder: 16,
    },
    {
      slug: "code-of-hammurabi",
      title: "Stèle du Code de Hammurabi",
      artist: "Anonyme (Babylone)",
      year: "c. 1750 av. J.-C.",
      medium: "Basalte",
      dimensions: "225 cm (hauteur)",
      description:
        "Le plus ancien code de lois complet connu. Les 282 articles gravés en cunéiforme akkadien régissent commerce, propriété, famille et peine. Au sommet, Hammurabi reçoit les lois du dieu Shamash.",
      link: "https://en.wikipedia.org/wiki/Code_of_Hammurabi",
      positionX: 11,
      positionZ: 0,
      shape: "MONOLITH" as const,
      scale: 1.1,
      ...basalt,
      plinthWidth: 0.6,
      plinthHeight: 0.2,
      sortOrder: 17,
    },
    {
      slug: "seated-scribe",
      title: "Le Scribe accroupi",
      artist: "Anonyme (Égypte ancienne)",
      year: "c. 2600–2350 av. J.-C.",
      medium: "Calcaire peint, cristal de roche, magnésite",
      dimensions: "53,7 cm (hauteur)",
      description:
        "Figurine d'un scribe en position d'écoute, genoux croisés, papyrus déployé sur les cuisses. Les yeux incrustés de cristal donnent à ce fonctionnaire de l'Ancien Empire un regard saisissant de vie.",
      link: "https://en.wikipedia.org/wiki/The_Seated_Scribe",
      positionX: 0,
      positionZ: -5,
      shape: "SPHERES" as const,
      scale: 0.9,
      ...limestone,
      plinthWidth: 0.6,
      plinthHeight: 0.8,
      sortOrder: 18,
    },
  ];

  for (const s of sculptures) {
    await prisma.artwork.create({
      data: { expoId: expo.id, type: "SCULPTURE", ...s },
    });
  }
  console.log(`Created ${sculptures.length} sculptures.`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

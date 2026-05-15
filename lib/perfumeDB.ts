// lib/perfumeDB.ts

export interface Note {
  name: string;
  cat: string;
  layers: ("top" | "mid" | "base")[];
}

// ==========================================
// 1. RAW DATA STRINGS (SAMA SEPERTI SEBELUMNYA)
// ==========================================
const RAW: Record<string, string> = {
  citrus: "Bergamot,Bigarade,Bitter Orange,Blood Orange,Buddha's hand,Calamansi,Candied Lemon,Chen Pi,Chinotto,Citron,Citrus Japonica,Citrus Water,Citruses,Clementine,Crystalfizz,Finger Lime,Grapefruit,Grapefruit Leaf,Grapefruit Peel,Grapefruit Soda,Green Tangerine,Hassaku,Hatkora Lemon,Kaffir Lime,Kumquat,Lemon,Lemon Balm,Lemon Myrtle,Lemon Tree,Lemon Verbena,Lemon Zest,Lemongrass,Lime,Limetta,Litsea Cubeba,Mandarin Orange,Mandora,Methyl Pamplemousse,Neroli,Orange,Palestinian Sweet Lime,Perfume lemon,Petitgrain,Pokan,Pomelo,Quenepa,Rangpur,Red Mandarin,Rind Bergamot,Shiikuwasha,Sudachi citrus,Tangelo,Tangerine,Tangerine Zest,Yuzu",
  greens: "Acronychia pedunculata,Agave,Algae,Almaciga,Aloe Vera,Ammophila (Beach Grass),Angelica,Angelica Root,Apple Mint,Arnica,Aromatic Notes,Artemisia,Asparagus,Assam Tea,Avocado,Azolla (Water Fern),Bagas de Zimbro,Banana Leaf,Barley,Barrenwort,Basil,Bay Essence,Beachheather,Behini Tree,Betel Leaf,Bigarane™,Black Currant Leaf,Blackberry Leaf,Blonde Tobacco,Blue Bugle,Borage,Borneol,Bran,Buchu or Agathosma,Buckwheat,Buckwheat Tea,Bulletwood Tree,Bulrush,Burdock,Cactus,Calamus,Calycanthus,Cangzhu,Cannabis,Caper,Capitiú,Carnation Leaves,Catnip,Cedar Leaves,Cedar Roots,Celery,Celery Seeds,Centella Asiatica,Chaparral,Cherry Leaf,Chicory,Chinese Medicinal Herbs,Chive,Chlorophyll,Chuan Xiong,Cilantro,Citron Leaf,Clary Sage,Coca,Coleus,Creosote Bush,Crithmum,Davana,Deer Tongue Grass,Dried Fallen Leaves,Duck Poo Oolong,Earl Grey Tea,Fermented Tea,Fern,Flouve,Fo Ti (Ho Shou Wu),Fougère Accord,Fresh Evergreen,Fresh note,Frostwood™,Gajumaru Banyan,Galbanum,Garlic,Genmaicha,Geranium Macrorrhizum (Zdravetz),Gingergrass,Ginkgo,Ginseng,Grape Leaves,Grass,Green Branches,Green Chilli,Green Forest,Green Notes,Green Pepper,Green Sap,Gromwell,Guao or Maiden Plum,Gyokuro Tea,Hat Straw,Hay,Henna,Hops,Horseweed,Huang Lian,Immortelle,Ivy,Jambu,Jatamansi or Spikenard,Jin Xuan Tea Leaves,Jojoba,Juniper,Katrafay,Katsura Leaf,Keemun Tea,Kewra,Khella,Kunzea,Laminaria,Lantana leaf,Lapsang Souchong Tea,Laurissilva Forest,Lesser Calamint,Lettuce,Lily-of-the-Valley Leaves,Limnophila Aromatica,Linaloe Berry,Lishan Tea,Longjing Tea,Lovage Root,Ma-Kwaen,Mandrake,Marigold,Marjoram,Matcha Tea,Mate,Melilot or Sweet Clover,Menthol,Mimosa Leaves,Mint,Mistletoe,Mugwort,Naswar,Nettle,Nut Grass,Oak Leaves,Oat,Olive Leaf,Oolong Tea,Orchid Leaf,Oregano,Palm Leaf,Palmarosa,Pandan Leaf,Pandanus,Parsley,Peach Leaf,Pear Leaf,Pennyroyal,Pesto,Petrichor,Peyote,Physcool®,Pinesap,Polygonum,Portulaca or Pigweed,Posidonia,Pu'er Tea,Purslane,Raspberry leaf,Red Algae,Reed,Rice,Rooibos Red Tea,Roots,Rose Leaf,Rose Thorn,Rosemary,Roseroot,Rosewood Leaf,Rue,Rumex,Rye,Sabah Snake Grass,Sage,Sansevieria,Sap,Satureja,Saw Palmetto,Seaweed,Sedge,Senecio,Shiso,Sideritis Mountain Tea,Silk Vine or Milk Broom,Siriuba Tree,Skunk Cabbage,Snake Plant,Soapwort,Spearmint,Spinach,Stems Greens,Strawberry Leaf,Strawberry Plant,Sugandha Kokila,Sundew,Swartzia,Sweet Grass,Tangerine Leaves,Tansy,Tarragon,Tea,Thai Tea,Thistle,Thyme,Ti Leaf (Cordyline),Tieguanyin Tea,Tobacco,Tomato Leaf,Torreya,Trees,Tulsi,Tumbleweed,Turnera Diffusa (Damiana),Valerian,Vanilla Leaves,Vine,Violet Leaf,Water Lily Leaf,Wheat,White Meranti,Wild carrot,Wild garlic leaf,Willow-Leaved,Winter Tea,Wintergreen,Woodruff or Galium Odoratum,Wormwood,Yarrow,Yunnan Red Tea",
  flowers: "Abelia,Acacia,Acerola Blossom,African Marigold,Aglaia,Alba Rose,Albizia,Almond Blossom,Alpinia,Alstroemeria,Althaea,Alumroot,Alyssum,Amarillys,Amazon Moonflower,Amethyst Flower,Anemone,Angel's Trumpet,Apple Blossom,Apricot Blossom,Ashoka Flower,Asian Clintonia,Astragalus,Azalea,Azteca Lily,Baby's Breath,Banana Flower,Banksia Australian,Begonia,Belladona,Bellflower,Bergamot Blossom,Bird cherry,Black Currant Blossom,Blackberry Blossom,Blue Lilies,Blue Poppy,Bluebell,Bottlebrush,Bougainvillea,Bread Flower,Bromelia,Buddleia,Butomus Umbellatus,Buttercup,Cacao Blossom,Cactus Blossom,Calendula,Calla Lily,Camellia,Campion Flower,Cananga,Cannonball Flower,Carambola Blossom,Cardamom Flower,Carnation,Cashew Flower,Celosia,Chai Hu,Chamomile,Champaca,Cherry Blossom,Chimonanthus or Wintersweet,China Rose,Chinotto blossom,Chocolate Flower,Christmas Tree or Flame Tree,Chrysanthemum,Cistus Incanus,Clematis,Clover,Coconut Blossom,Coffee Blossom,Cornflower Sultan Seeds,Cosmos Flower,Costus,Cotton Flower,Creamy Flowers,Crinum Lily,Cucumber Flower,Cyclamen,Dahlia,Daisy,Dandelion,Daphne,Daylily,Deadnettle,Delonix,Desert Rose,Dianthus,Diviniris,Dogwood Blossom,Dove Tree,Dried Rose,Dyer's Greenweed,Edelweiss,Eglantine Rose,Elderflower,Encian,Erigeron (Fleabane),Euphorbia,Eustoma | Lisianthus,Evergreen,Field Scabious,Fig Blossom,Fire Lily,Flamingo Flower (Anthurium),Flax,Floral Notes,Forget Me Not,Fragonia,Freesia,French Marigold,Fringed Pink,Fuchsia,Geranium,Gerbera,Gladiolus,Goldenrod,Gorse,Grapeflower,Great Burnet,Green Nard,Green Tea Flower,Grevillea,Guava Blossom,Guayacan,Gustavia Flower,Hawthorn,Hazel Blossom,Heather,Heliotrope,Hellabore Flower,Hemlock,Hibiscus,Hoary Stock,Holly Flower,Hollyhock,Honeybush or Cyclopia,Honeydew Blossom,Hortensia,Hoya Carnosa Wax Plant,Hyacinth,Hyssop,Impatiens,Inula,Iris,Iris Butter,Iris Pallida,Jacaranda,Jade Flower,Jarana Flower,Jasmine Orchid,Jujube Blossom,Kadam,Kangaroo Paw,Kanuka,Karmaflor®,Kiwi blossom,Kudzu,Laburnum,Lady of the Night Flower,Lady Slipper Orchid,Lamduan Flower,Lamprocapnos,Lantana,Larkspur,Laurel Blossom,Lavender,Leatherwood,Ledum,Liatrix,Licorice Flower,Lilac,Lily-of-the-Valley,Lime (Linden) Blossom,Litchi Blossom,Longoza,Lotus,Lupin,Lydia Broom,Lysylang,Macadamia Flower,Magnolia,Magnolia Brooklynensis,Magnolia Leaf,Mahonial,Malva,Mango Blossom,Mariposa Lily,Mayflower,Meadowsweet,Melilotus,Melissa Flower,Michelia,Michelia leaf,Mignonette,Milkweeds,Mimosa,Mimusops Elengi,Mirabilis,Monarda,Monoi Oil,Moringa Blossom,Morning Glory Flower,Moss Flox,Myrtle,Narcissus,Nard,Nasturtium,Nectarine Blossom,Nerium Oleander,Nigella,Night Blooming Jasmine,Nom Maew,Olive flower,Opium,Orange Cassia Tree,Orange Flower Water,Orchard Blossom,Orchid,Orchid Black Diamond,Orchid Cactus,Orchid Pink Leopard,Ornithogalum,Orris Root,Osmanthus,Pansy,Papaya Blossom,Paramela,Passion Flower,Pataqueira,Peach Blossom,Pear Blossom,Pelargonium,Peony,Periwinkle,Petalia,Petunia,Phlox,Pikul Flower,Pineapple Blossom,Pink Flamingo Heliconia,Pink Lily,Pinwheel Flower,Pitahaya Flower,Pittosporum,Plum Blossom,Plumeria,Poinsettia,Pomegranate Blossom,Poppy,Portlandia,Primrose,Princess Tree (Paulownia),Privet,Protea,Prunella,Purple Coneflower,Queen of the Night Flower,Rangoon Creeper,Raspberry Blossom,Redwood Flower,Reseda,Rhododendron,Rosa Alba,Rosa Rubiginosa,Rose,Rose Hip,Rose Japanese (Hamanasu),Rose Mallow,Rosebay Willowherb,Rosebud,Roselle,Rosyfolia,Safflower,Sainfoins,Sand Lily,Sandalwood Flower,Santolina,Saucer Magnolia,Sea Daffodil,Siberian Rhododendron,Silk Tree Blossom,Silverthorn Flower,Skeleton Flower,Smoketree,Snakeroot,Snow Lotus,Snowdrops,Solomon's Seal,Sophora Toromiro Flower,Sour Cherry Blossom,Spanish Broom,Spiraea,St. John's Wort,Star Magnolia,Starflower,Strawberry Flower,Strelitzia,Strobilanthes Callosa,Sunflower,Sweet Pea,Taif Rose,Tamarisk,Tobacco Blossom,Transparent Flowers,Trillium,Tulip,Tussilago farfara,Vanilla Bahiana,Viburnum,Violet,Violet Woodsorrel,Wallflower,Waratah,Water Flowers,Water Hyacinth,Water Lily,Weeping Cherry Blossom,White Champaca,White Dahlia,White Ginger Lily,White Lace Flower,White Tea Blossom,Wildflowers,Winter Daphne,Wisteria,Wrightia,Yellow Bells,Yellow Flowers,Ylang-Ylang,Yunnan Osmanthus,Yuzu Flower,Zinnia",
  whiteFlowers: "Arum Lily,Belanis,Black Locust,Boronia,Carissa,Datura,Frangipani,Gardenia,Grapefruit Blossom,Honeysuckle,Jasmine,Karo-Karounde,Lemon Blossom,Lily,Mandarin Orange Blossom,Melati,Mock Orange,Moon Flower,Night Blooming Cereus,Orange Blossom,Stephanotis,Syringa,Tangerine Blossom,Tiare Flower,Tuberose,White Flowers,White Tobacco",
  fruits: "Acai Berry,Acerola,Acorn,Akebia fruit,Almond,Apple,Apple Juice,Apple Pulp,Apple Sherbet,Apricot,Arctic Bramble,Argan,Artichoke,Ashberry,Banana,Barberry,Bearberry,Beetroot,Berries,Bitter melon,Black Cherry,Black Currant,Black Sapote,Black Walnut,Blackberry,Blackthorn,Blueberry,Boysenberry,Brazil Nut,Breadnut,Buriti,Burning Cherry,Cabernet Grape,Candlenut,Cantaloupe,Carambola (Star Fruit),Carrot,Cashew,Cassowary Fruit,Cauliflower,Cepes,Chayote,Cherimoya,Cherry,Cherry Jam,Chestnut,Chia Seed,Chickpeas,Chinese Magnolia,Cider Apple,Cloudberry,Coco De Mer,cocoa shell,Coconut,Coconut Water,Cogumelo Porcino,Conifer,Corn,Corn Silk,Count's Fruit,Cranberry,Crimson Fruits,Cucumber,Cupuaçu Cupuassu Copoasu,Currant Leaf and Bud,Cyperus Scariosus,Daikon Radish,Dark Plum Wu Mei,Decalepis hamiltonii,Dewberry,Dried Apple Crisp,Dried Apricot,Dried Fruits,Durian,Elderberry,Feijoa Fruit,Fig,Fig Leaf,Fig Milk,Filbertone,Flowering Gourd,Forest Fruits,Frosted Berries,Fruit Salad,Fruity Notes,Fuji Apple,Gariguette Strawberry,Genipapo,Goji Berries,Goldenberry,Gooseberry,Grains,Grape Seed,Grapes,Green Anjou Pears,Green Grape,Green Pear,Green Plum,Greengage,Ground Cherry,Guarana,Guava,Hazelnut,Hog Plum,Honeydew Melon,Isabella Grape,Jabuticaba,Jackfruit,Japanese Loquat,Jobs Tears (Yi Yi Ren),Kiwi,Kumbaru,Lingonberry,Litchi,Loganberry,Longan Berries,Lotus Seed,Lucuma,Macadamia,Mahonia,Malt,Mamey,Mango,Mangosteen,Maninka,Marian Plum,Medlar,Melon,Millet,Mirabelle,Miracle Berry,Moepel Accord,Mulberry,Mung Bean,Mushroom,Nashi Pear,Nectarine,Nutty Notes,Okra Seeds,Olive,Papaya,Passionfruit,Pea,Peach,Peanut,Pear,Pecan,Persimmon,Peruvian Pepper,Pineapple,Pinot Noir Grapes,Pistachio,Pitahaya,Pitanga,Plantain,Plum,Pomegranate,Potato,Prickly Pear,Pumpkin,Purple Yam,Quandong Desert Peach,Quince,Rambutan,Raspberry,Red Apple,Red Berries,Red Currant,Red Fruits,Red Fruits Smoothie,Red Mulberry,Rhubarb,Roasted Nuts,Rose Apple,Rowanberry,Salak,Santol,Sapodilla,Sarsaparilla,Sea Buckthorn,Seriguela,Serrano Pepper,Shea Butter,Shea Nuts,Silverberry,Snowberry,Sour Cherry,Soursop,Soybean,Squash,Star Apple,Strawberry,Strawberry Jam,SugarLoaf Pineapple,Tamanu,Tapioca,Taro,Tayberry,Tomato,Tropical Fruits,Tropicalone,Tucumã,Vegetal Notes,Walnut,Walnut Milk,Water Fruit,Watermelon,Wattleseed,White Currant,White Grape,White Mulberry,Wild Strawberry,Williams Pear,Winterberry,Wintermelon,Wolfberry,Yellow Cherry,Yellow Fruits,Yuca Cassava,Yumberry,Zucchini",
  spices: "Allspice,Anise,Asafoetida,Baking Spices,Bay Leaf,Bengal Pepper,Biryani,Black Sesame,Cacao Pod,Caraway,Cardamom,Carolina Reaper,Carum,Cassia,Chutney,Cinnamon,Cinnamon Leaf,Clove Leaf,Cloves,Coffee,Coffee CO2,Coffee Tincture,Coriander,Cubeb or Tailed Pepper,Cumin,Curcuma (Turmeric),Curry,Curry Tree,Dill,Fennel,Fenugreek,Galanga,Ghost Pepper,Ginger,Green Coffee,Guinea Pepper,Indian Spices,Japanese Pepper,Kaempferia Galanga,Kopi Luwak Coffee,Licorice,Mace,Mustard Seed,Nutmeg,Oily Notes,Oriental Notes,Pepper,Peppertree,Pimento,Pimento Leaf,Pimento Seeds,Pink Pepper,Priprioca,Saffron,Safraleine,Sesame,Siam Cardamom,Sichuan Pepper,Spicy Notes,Spiked Pepper,Star Anise,Sumac,Tamarind,Timur,Tonka Bean,Toscanol,Ultravanil™,Vanilla,Wan Sao Lhong,Wasabi,Water Pepper,West Indian Bay",
  sweets: "Acetyl Furan,Affogato,Agave Nectar,Apple liquor,Apple Pie,Apricot Jam,Aspic,Baba (Italian dessert),Baguette,Baked Apple,Baked Pear,Baklava,Banana Bread,Biscotti,Biscuit,Blueberry Jam,Bonbon,Bread,Brioche,Brown Sugar,Brownie,Bubbaloo,Bubble Gum,Burnt Sugar,Butter,Buttercream,Butterscotch,Cacao Butter,Cake,Calissons d'Aix,Candied Flowers,Candied Fruits,Candied Ginger,Candied Lemon,Candied Orange,Candies,Candy apple,Canelé,Caramel,Caramelized Almond,Cassata Siciliana,Cereal,Chamallow,Chantilly Cream,Cheesecake,Cherry Milk,Cherry Syrup,Chocolate Fudge,Chocolate Sauce,Chocolate Truffle,Choux Pastry,Churros,Cocoa Pulse™,Coconut Pie,Coconut Powder,Condensed Milk,Cone Waffle,Confetti (Sugared Almonds),Cookie,Cookie Dough,Cosmofruit™ (IFF),Cotton Candy,Cream,Creamsicle,Creamy notes,Crème Brûlée,Croissant,Cupcake,Custard,Czech Christmas Cookies (Linecké),Danish pastry,Dark Chocolate,Dark Chocolate Liqueur,Dates,Donut or Doughnut,Dorayaki,Dragee,Dragibus,Dulce de Leche,Eggnog,Fougassette,French Pastries,Fresh Cream,Frosting [Glacé],Gelatin,Gelato,Gianduia,Gingerbread,Gourmand Accord,Graham Crackers,Griotte Cherries,Gummy Candies,Halva,Ham,Hazelnut Cocoa Spread,Honey,Honeycomb,Horchata,Ice cream,Icing Pink,Jelly,Jellybean,Jiuniang (Sweet Fermented Rice Wine),Jujube,Kiwi Jam,Knafeh,Kulfi,Kunafa,Lemon Meringue Pie,Lemon Pie,Loukhoum,Macarons,Madeleine,Maple Syrup,Maraschino Cherry,Marmalade,Marron Glacé,Marshmallow,Marzipan,Meringues,Milk Candy,Milk Cream,Milk Mousse,Milkshake,Milky Coffee,Molasses,Nectar,Nougat,Nutella,Oatmilk,Orange Gelato,Orange Marmalade,Palm Sugar,Pan de Muerto,Pan Di Spagna,Pancake,Pandoro,Panettone,Panna Cotta,Pastiera Napoletana,Peach Cream,Peanut Butter,Pear Ice Cream,Pistachio Spread Cream,Popcorn,Popsicle,Powdered Sugar,Praline,Pretzel,Profiterole,Pudding,Puff Pastry,Pumpkin Pie,Rainbow Sorbet,Raspberry Macaron,Red Fruits Sorbet,Rice Cake,Rice Pudding,Rose Jam,Rose Milk,Sacher Torte,Salted Butter,Salted Caramel,Salted Caramel Fudge,Scone,Shortcrust Pastry,Sorbet,Souffle,Sour Cream,Speculoos,Sprinkles,Spun Sugar,Starburst Candy,Strawberry Fizz Candy,Strawberry S'mores,Strawberry Syrup,Sugar,Sugar Syrup,Sweet Pie,Tanghulu,Tartine,Tiramisu,Toast,Toasted Coconut,Toasted Rice,Toffee,Tres Leches,Tropézienne Tarte,Tupig,Vanilla Caviar,Vanilla Macaroon,Waffle,White Chocolate,White Chocolate Truffle,Whoopie Pie,Yogurt,Zefir",
  woods: "Agarwood (Oud),Akigalawood,Alder,Almond tree,Amaranth,Amberever,Amburana Bark,Amburana Wood,Amyris,Apple Tree,Araucaria,Arbutus (Madrona Bearberry Tree),Argan Tree,Aspen,Australian Blue Cypress,Australian Oud,Bamboo,Baobab,Bark,Beech,Belambra Tree,Birch,Black Hemlock or Tsuga,Black Spruce,Blackwood,Blonde Woods,Brazilian Rosewood,Buddha Wood,Buxus,Cabreuva,Cambodian Oud,Canadian Balsam,Carob Tree,Cascarilla,Cashmir wood,Cedar,Chalood Bark,Charred Wood,Cherry Tree,Chinese Oud,Chypre Notes,Clearwood,Cocobolo,Coconut Tree,Coffee Tree,Cork,Cottonwood (Poplar),Cypress,Cypriol Oil or Nagarmotha,Dark Patchouli,Dartanol®,Desert Sagebrush,Ditax wood,Dreamwood,Driftwood,Dry Wood,Ducke,Ebony Tree,Elm,Eucalyptus,False Cypress,Fig tree,Fir,Gaharu Buaya,Grass Tree,Guaiac Wood,Hiba,Himalayan Cedar,Hinoki Wood,Ho Wood,Incienso,Indian Oud,Indian Sandalwood,Indian Woods,Indonesian Oud,Ironwood,Ishpink Ocotea Quixos,Kenya Rosewood,Kowhai,Kyara wood,Laotian Oud,Larch,Lichen,Liquidambar,Mahogany,Malaysian Oud,Mango Tree,Manuka,Maple,Massoia,Mesquite,Mesquite Wood,Muhuhu,Mulberry plant,Mysore Sandalwood,Neem,Nootka,Oak,Oakmoss,Olive Tree,Oud Butter,Oud Sumatra,Palisander Rosewood,Palo Santo,Palo Verde Tree,Pamplewood,Paper Mulberry,Paperbark,Papyrus,Paraguayan Green Sandalwood,Patchouli,Patchouli (Green),Peach Tree,Pear Tree,Pepperwood or Hercules Club,Phoebe zhennan,Pine Tree,Pink Ipê Tree,Plum Tree,Pua Keni Keni (Pua-Lulu),Ravenala,Ravensara,Red Willow,Redwood,Rhizoma Atractylodis,Saman,Sandalore™,Sandalwood,Sassafras,Satinwood,Sawdust,Scots pine variant,Selaginella tamariscina,Sequoia,Siam,Siam Wood,Spruce,Sycamore,Takamaka,Tamboti Wood,Tatami,Teak Wood,Thailand Oud,Thanaka Wood,Thuja,Transparent Woods,Trat Oud,Velvet Woods,Vetiver,Vietnamese Oud,White Oud,White Willow,Wolfwood,Wood barrel,Woody Notes,Yohimbe,Z11™",
  resins: "Amberwood,Andiroba,Bakhoor,Balsamic Notes,Balsamic Vinegar,Benzoin,Birch Tar,Bisabolene,Blue Amber,Bois d'Encens,Breu-Branco,Bushman Candle,Cade oil,Choya Loban,Choya Nakh,Choya Ral,Coal Tar,Copahu Balm,Copaiba Balm,Copal,Dragon Blood Resin,Elemi,Estoraque,Gurjun Balsam,Incense,Japanese Incense,Labdanum,Mastic or Lentisque,Mopane,Myrica,Myrrh,Nag Champa,Olibanum (Frankincense),Olibanum Sacra Resin Green,Opoponax,Peru Balsam,Pine Tar,Poplar (Populus) Buds,Resins,Rubber,Styrax,Surf Wax,Tea Tree Oil",
  musk: "Akashic Acord,Aldron,Amber,Amber Xtreme,Ambergris,Amberketal,Ambertonic™ (IFF),Ambrarome,Ambrein,Ambretone,Ambrette (Musk Mallow),Ambrettolide,Ambrocenide (Symrise),Ambronova ™,Ambrostar,Ambroxan,Animal Notes,Anthamber™,Bacon,BBQ,Beeswax,Cachalox,Carrot Seeds,Castoreum,Caviar,Cetalox,Cheese,Civet,Civettone,Coral Reef,Daim,Exaltolide®,Feathers,Fur,Genet,Goat Hair,Goat's Milk,Grisalva,Habanolide®,Horse skin,Hyraceum,Kephalis,Kyphi,Leather,Meat,Milk,Muscone,Musk,Muskrat,Onycha,Oysters,Saffiano Leather,Sea Shells,Skatole,Skin,Skin musk,Starfish,Suede,Sylkolide,Tolu Balsam,Truffle,Velvione™",
  beverages: "Absinthe,Advocaat,Almdudler,Amaretto,Amarula,Aperol,Applejack,Baileys Irish Cream,Batida,Beer,Beer/Ale,Bellini,Blackcurrant Juice,Blue Margarita,Bohea (Wuyi Tea),Boozy Notes,Bourbon Whiskey,Brandy,Buttered Rum,Buttermilk,Cachaça,Caffè Latte,Caipirinha,Calvados Drink,Campari,Cappuccino,Chai Latte,Champagne,Champagne Rosé,Cherry Liqueur,Chinotto,Coca-Cola,Cocktail accord,Cocktail Fruits,Coffee Liqueur,Cognac,Cosmopolitan Cocktail,Cream Liqueur,Cream Soda,Curaçao,Daiquiri,Eau de Vie,Espresso,Espresso Coffee,Frothed milk,Fruit Tea,Génépi,Gin,Goldwasser,Grenadine,Hi-Fi,Hot Chocolate,Ice Wine,Jasmine Tea,Kava Drink,Kir Royal,Kombucha,Lemon Soda,Lemonade,Limoncello,Liquor,Macchiato,Madeira,Mai Tai Cocktail,Margarita,Martini,Masala Chai,Mezcal,Midori,Mint Tea,Mocha,Mojito,Moonshine,Moscow Mule,Mulled Wine,Negroni,Orange Soda,Ouzo,Pear Juice,Pina Colada,Pisco Sour Cocktail,Pistachio Liquer,Plum Brandy,Plum Wine,Port Wine,Prosecco,Punch,Raki,Red Wine,Rhum Agricole,Rice Water,Root Beer,Rum,Sake,Sangria,Sauce-aroma Baijiu,Sex on the beach,Sherry,Soju,Sour Milk,Soy Milk,Sparkling Water,Sparkling Wine,Sweet Milk,Syrup,Tequila,Tokaji Wine,Tonic Water,Triple Sec,Umeshu,Vermouth,Vinegar,Vodka,Whiskey,White Wine,Wine Lees,Wine must,Yellow Wine",
  syntheticWeird: "Pepperwood™,Accord Eudora®,Airy Note,Alcantara Accord,Aldambre,Aldehydes,Aluminum,Ambermax™,Ambreine,Ambrettolide,Ambrinol,Ambrofix™,AMBROX® SUPER,Ammonia,Amyl Salicylate,Antillone™,Apple Shisha Accord,Aqual™,Aquozone,Ash,Asphalt,Azarbre,Black Diamond,Black Leather,Blood,Boisiris,Bourgeonal,Brick,Brown Scotch Tape,Burnt Match,Calone,Calypsone,Camphor,Candle Wax,Canvas,Caoutchouc,Cascalone,Cashalox,Cashmeran,Cetonal®,Chalk,Cigarette,Cinnamaldehyde,Clarycet,Clay,Clean notes,CO2 Extracts,Coal,Coal Tar Pitch,Cobblestone,Cocaine,Concrete,Copper,Coral Limestone,Coranol,Cork,Cosmone,Coumarin,Credit Cards,Crustaceans,Cuban Cigar,Cyclopidene,Damascone,Desert Rain Accord,Dew Drop,Dihydromyrcenol,Dirt,Diving Suit,Dodecanal,Dust,Earth Tincture,Earthy Notes,Egg,Ember,Ethyl Maltol,Ethylvanillin,Eugenol,Evernyl,Fabric,Factor X,Fior di Latte,Fire,Fish,Flint,Floralozone,Floratta DNA,Flour,Flower Prism,Galaxolide,Gasoline,Georgywood,Geosmin,Glass,Gold,Graphite,Grease,Guaiacol,Gunpowder,Hair Pomade,Hand Cream,Hashish,Head Space Waterfall,Healingwood,Heated metal,Hedione,Helvetolide,Hexenyl Green,Hexyl Acetate,Hina,Hindinol,Hivernal®,Holy Water,Hot Iron,Ice,Indole,Industrial Glue,Ink,Inkstick,Instant Film Accord,Iodine,Ionones,Iso E Super,Isobutyl Quinoline,Jasmolactone,Jasmone,Javanol,Jeans,Lacquered Wood,Lactones,latex,Lava,Lilybelle®,Linen,Lip Gloss,Lipstick,Little Doll Strawberry,Loam,Lorenox,Magnolan,Marble,Mascarpone Cheese,Mayonnaise Accord,Melbaton,Melonal,Metallic Notes,Mineral Notes,Mitti Attar,Molasses,Money,Motor Oil,Mountain Air,Mousse de Saxe,Mud,Mugane,Muscenone,Mystikal,Nail Polish,NaturalCalm™,Neoprene,New Magazine,Norlimbanol™,Nympheal™,Old Books,Old Furniture,Old House,Operanide,Orbitone,Orcanox™,Osmasylk Natsublim™,Oud Smoke,Ozonic Notes,Paper,Para-Cresyl Phenyl Acetate,Paradisone,Parchment,Pearadise®,Pearls,Peat,Pebbles,Pencil,Petroleum,Pharaone®,Pink Crystal,Pink Himalayan Sea Salt,Pizza,Plasma,Plastic,Plastic Bag,Play-Doh,Poison,Poivrol,Pollen,Pomarose,Porcelain,Porcelain clay,Powdery Notes,Priest's Clothes,Propolis,Prunol,Rain Notes,RE Base,Red Bean Paste,Red Lantern,Rhodinol,Rice Powder,River Notes,Romandolide®,Rose Oxide,Safrole,Salicylic Acid,Salt,Sand,Santamanol™,Satin,Sauna,Scent Trek®,Sclarene,Sea Foam,Sea Water,Serenolide,Shamama Attar,Silk,Silver,Sinfonide,Siren,Sisal Rope,Slate,Smoke,Snow,Soap,Soda Bubbles,Sodium Silicate,Solar Notes,Soy Sauce,SP3 Carbon,Sparkling Accord,Spiranol,Spray Paint,Squishmallow Accord,Stardust,Steam accord,Stone,Straw,Suederal®,Sulphur,Sunscreen,Suntan Lotion,Sweat,T-Shirt accord,Talc,Tar,Tennis Ball,Terpineol,Terracotta,Terranol,Thalassogaia™,Timberol,Timbersilk™,Tires,Tomato Sauce,Tonalide®,Tonquitone™,Toothpaste,Trimofix®,Tuberolide,Tulle accord,Vanillin,Varnish Accord,Veloutone,Velvet,Verdox,Vinyl,Vinyl Guaiacol,Vitamin C,Water,Western Honey Bee,Wet Plaster,Wet Stone,White Leather,Wool,Yeast,Z-11 HD",
  uncategorized: "Canna flower,Fog,Forest Foliage,Gun Smoke,Hookah,Jonquille,Mangrove Wood,Mochi,Moxalone,Nemophila,Obsidial ®,Pandan,Paradisamide,Rocket fuel,Salted Egg Yolk,Sea cucumber,Sorghum,Strawberry Yogurt,Sugar cookie,Sweet Alyssum,Sweet Potato,Umami,Vervain"
};

// ==========================================
// 2. MAP CATEGORY -> DEFAULT LAYERS
// ==========================================
const layerMap: Record<string, ("top" | "mid" | "base")[]> = {
  citrus: ["top"],
  greens: ["top"],
  flowers: ["mid"],
  whiteFlowers: ["mid"],
  fruits: ["top", "mid"],
  spices: ["top", "mid"],
  sweets: ["base"],
  woods: ["base"],
  resins: ["base"],
  musk: ["base"],
  beverages: ["top", "mid", "base"],
  syntheticWeird: ["mid"],   // kita override yang spesifik nanti
  uncategorized: ["mid"],
};

// Special overrides: beberapa note spesifik kita atur layer-nya manual
const specialLayers: Record<string, ("top" | "mid" | "base")[]> = {
  "Neroli": ["top", "mid"],
  "Orange Blossom": ["top", "mid"],
  "Petitgrain": ["top", "mid"],
  "Lavender": ["top", "mid"],
  "Cardamom": ["top", "mid"],
  "Pink Pepper": ["top", "mid"],
  "Vanilla": ["base"],
  "Tonka Bean": ["base"],
  "Benzoin": ["base"],
  "Coffee": ["mid", "base"],
  "Honey": ["mid", "base"],
  "Rum": ["top", "mid", "base"],
  "Whiskey": ["top", "mid", "base"],
  "Aldehydes": ["top"],
  "Iso E Super": ["base"],
  "Ambroxan": ["base"],
  "Calone": ["top"],
  "Coumarin": ["base"],
  "Ethyl Maltol": ["base"],
  "Musk": ["base"],
  "Patchouli": ["base"],
  "Vetiver": ["base"],
  "Sandalwood": ["base"],
  "Oud": ["base"],
};

// ==========================================
// 3. BUILD THE FULL NOTES ARRAY
// ==========================================
const NOTES: Note[] = [];

for (const [cat, str] of Object.entries(RAW)) {
  const names = str.split(',').map(n => n.trim()).filter(Boolean);
  const defaultLayers = layerMap[cat] || ["mid"];
  for (const name of names) {
    const layers = specialLayers[name] || defaultLayers;
    NOTES.push({ name, cat, layers });
  }
}

// ==========================================
// 4. HELPER FUNCTIONS
// ==========================================
const getPool = (
  layers: ("top" | "mid" | "base")[],
  includeSynth: boolean,
  excludeNames?: Set<string>
): Note[] => {
  return NOTES.filter(n => {
    if (excludeNames?.has(n.name)) return false;
    if (!includeSynth && ["Synth/Weird", "Beverage"].includes(n.cat)) return false;
    return n.layers.some(l => layers.includes(l));
  });
};

export const getRandomItems = <T>(arr: T[], count: number): T[] => {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
};

export const PREFIXES = [
  "L'Eau de", "Midnight", "Velvet", "Golden", "Mystic",
  "Savage", "Royal", "Secret", "Whisper of", "Oud",
  "Soleil", "Fleur de", "Elixir of",
];

export interface Recipe {
  name: string;
  top: Note[];
  mid: Note[];
  base: Note[];
}

export const getRandomRecipe = (
  counts: { top: number; mid: number; base: number },
  includeSynth: { top: boolean; mid: boolean; base: boolean }
): Recipe => {
  const poolTop = getPool(["top"], includeSynth.top);
  const poolMid = getPool(["mid"], includeSynth.mid);
  const poolBase = getPool(["base"], includeSynth.base);

  const top = getRandomItems(poolTop, counts.top);
  const mid = getRandomItems(poolMid, counts.mid);
  const base = getRandomItems(poolBase, counts.base);

  const mainEntity = getRandomItems([...mid, ...base], 1)[0].name.split(' ')[0];
  const prefix = getRandomItems(PREFIXES, 1)[0];

  return { name: `${prefix} ${mainEntity}`, top, mid, base };
};

export const getRandomRecipeWithLocks = (
  counts: { top: number; mid: number; base: number },
  includeSynth: { top: boolean; mid: boolean; base: boolean },
  locked: { top: Note[]; mid: Note[]; base: Note[] }
): Recipe => {
  const lockedNames = new Set([
    ...locked.top,
    ...locked.mid,
    ...locked.base,
  ].map(n => n.name));

  const poolTop = getPool(["top"], includeSynth.top, lockedNames);
  const poolMid = getPool(["mid"], includeSynth.mid, lockedNames);
  const poolBase = getPool(["base"], includeSynth.base, lockedNames);

  const remTop = Math.max(0, counts.top - locked.top.length);
  const remMid = Math.max(0, counts.mid - locked.mid.length);
  const remBase = Math.max(0, counts.base - locked.base.length);

  const top = [...locked.top, ...getRandomItems(poolTop, remTop)];
  const mid = [...locked.mid, ...getRandomItems(poolMid, remMid)];
  const base = [...locked.base, ...getRandomItems(poolBase, remBase)];

  const seedPool = [...mid, ...base];
  const mainEntity = seedPool.length > 0
    ? getRandomItems(seedPool, 1)[0].name.split(' ')[0]
    : 'Élixir';
  const prefix = getRandomItems(PREFIXES, 1)[0];

  return { name: `${prefix} ${mainEntity}`, top, mid, base };
};

// Ekspor seluruh database untuk keperluan UI (selector)
export const FULL_DATABASE = NOTES;

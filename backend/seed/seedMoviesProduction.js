/**
 * StreamFlix — Production Movie Seed Script
 *
 * Generated from cleaned seed export.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Movie from '../models/Movie.js';

export const movieCatalog = [
  {
    "title": "Spider-Man: Across the Spider-Verse",
    "year": 2023,
    "rating": 8.6,
    "duration": "2h 20m",
    "genres": [
      "Animation",
      "Action",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/xOA4MbyJZVJHGZ38wC4LPpruBBX.jpg",
      "publicId": null
    },
    "youtubeId": "shW9i6k8cB0",
    "synopsis": "Miles Morales catapults across the Multiverse where he encounters a team of Spider-People charged with protecting its very existence. When heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.",
    "cast": [
      "Shameik Moore",
      "Hailee Steinfeld",
      "Oscar Isaac",
      "Issa Rae"
    ],
    "director": "Joaquim Dos Santos",
    "smartLabel": "Critically Acclaimed"
  },
  {
    "title": "The Wild Robot",
    "year": 2024,
    "rating": 8.3,
    "duration": "1h 42m",
    "genres": [
      "Animation",
      "Drama",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/9mJ9dxCGpudxyBtlC0M9Y4pTyXN.jpg",
      "publicId": null
    },
    "youtubeId": "67vbA5ZJdKQ",
    "synopsis": "After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island and must learn to adapt to the harsh surroundings, gradually building relationships with the island's animals.",
    "cast": [
      "Lupita Nyong'o",
      "Pedro Pascal",
      "Kit Connor",
      "Bill Nighy"
    ],
    "director": "Chris Sanders",
    "smartLabel": "Emotionally Powerful"
  },
  {
    "title": "Puss in Boots: The Last Wish",
    "year": 2022,
    "rating": 7.9,
    "duration": "1h 42m",
    "genres": [
      "Animation",
      "Adventure",
      "Comedy"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/kuf6dutpsT0vSVehic3EZIqkOBt.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/q2fY4kMXKoGv4CQf310MCxpXlRI.jpg",
      "publicId": null
    },
    "youtubeId": "dFRmBmy6K7c",
    "synopsis": "Puss in Boots discovers that his passion for adventure has taken its toll: he has burned through eight of his nine lives. To restore them, he sets out on an epic journey to find the mythical Last Wish.",
    "cast": [
      "Antonio Banderas",
      "Salma Hayek",
      "Harvey Guillén",
      "Florence Pugh"
    ],
    "director": "Joel Crawford",
    "smartLabel": "Weekend Favourite"
  },
  {
    "title": "Elemental",
    "year": 2023,
    "rating": 6.8,
    "duration": "1h 41m",
    "genres": [
      "Animation",
      "Romance",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/4fLZUr1e65hKPPVw0R3PmKFKxj1.jpg",
      "publicId": null
    },
    "youtubeId": "hXzcyx9V0xw",
    "synopsis": "In a city where fire, water, land and air residents live together, a fiery young woman and a go-with-the-flow guy discover something elemental: how much they actually have in common.",
    "cast": [
      "Leah Lewis",
      "Mamoudou Athie",
      "Ronnie del Carmen",
      "Shila Ommi"
    ],
    "director": "Peter Sohn",
    "smartLabel": "Pixar Magic"
  },
  {
    "title": "Paddington in Peru",
    "year": 2025,
    "rating": 7.2,
    "duration": "1h 46m",
    "genres": [
      "Family",
      "Adventure",
      "Comedy"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/1ffZAucqfvQu36x1C49XfOdjuOG.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/7N7CtZftqEvgojR3QloukU0oWPg.jpg",
      "publicId": null
    },
    "youtubeId": "NTvudSGfHRI",
    "synopsis": "Paddington and the Brown family travel to Peru to visit Aunt Lucy at the Home for Retired Bears. When she mysteriously disappears, Paddington embarks on an exciting Amazonian adventure to find her.",
    "cast": [
      "Ben Whishaw",
      "Antonio Banderas",
      "Olivia Colman",
      "Emily Mortimer"
    ],
    "director": "Dougal Wilson",
    "smartLabel": "Perfect Family Night"
  },
  {
    "title": "Wonka",
    "year": 2023,
    "rating": 7,
    "duration": "1h 56m",
    "genres": [
      "Family",
      "Fantasy",
      "Musical"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/qhb1qOilapbapxWQn9jtRCMwXJF.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/yOm993lsJyPmBodlYjgpPwBjXP9.jpg",
      "publicId": null
    },
    "youtubeId": "otNh9bTjXWg",
    "synopsis": "With dreams of opening a chocolate shop in a legendary city, a young Willy Wonka discovers that the industry is run by a cartel of corrupt chocolatiers determined to stop him.",
    "cast": [
      "Timothée Chalamet",
      "Calah Lane",
      "Keegan-Michael Key",
      "Olivia Colman"
    ],
    "director": "Paul King",
    "smartLabel": "Magical Adventure"
  },
  {
    "title": "Moana 2",
    "year": 2024,
    "rating": 6.4,
    "duration": "1h 40m",
    "genres": [
      "Family",
      "Animation",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/aLVkiINlIeCkcZIzb7XHzPYgO6L.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/tElnmtQ6yz1PjN1kePNl8yMSb59.jpg",
      "publicId": null
    },
    "youtubeId": "fOEvUzUwDHI",
    "synopsis": "Moana embarks on a far-reaching voyage with a new crew to find a mysterious long-lost world, answering an unexpected call from her wayfinding ancestors.",
    "cast": [
      "Auli'i Cravalho",
      "Dwayne Johnson",
      "Temuera Morrison",
      "Nicole Scherzinger"
    ],
    "director": "David Derrick Jr.",
    "smartLabel": "Feel-Good Adventure"
  },
  {
    "title": "Kung Fu Panda 4",
    "year": 2024,
    "rating": 6.8,
    "duration": "1h 34m",
    "genres": [
      "Family",
      "Action",
      "Comedy"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/3ffPx9jqg0yj9y1KWeagT7D20CB.jpg",
      "publicId": null
    },
    "youtubeId": "Wrc2PtJLwQM",
    "synopsis": "Po must become a spiritual leader of the Valley of Peace, but first must protect it from a cunning shape-shifting sorceress who commands an army of villains.",
    "cast": [
      "Jack Black",
      "Awkwafina",
      "Viola Davis",
      "Bryan Cranston"
    ],
    "director": "Mike Mitchell",
    "smartLabel": "Action-Packed Comedy"
  },
  {
    "title": "Dune: Part Two",
    "year": 2024,
    "rating": 8.5,
    "duration": "2h 46m",
    "genres": [
      "Sci-Fi",
      "Action",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
      "publicId": null
    },
    "youtubeId": "Way9Dexny3w",
    "synopsis": "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. He must prevent a terrible future only he can foresee.",
    "cast": [
      "Timothée Chalamet",
      "Zendaya",
      "Rebecca Ferguson",
      "Josh Brolin"
    ],
    "director": "Denis Villeneuve",
    "smartLabel": "Epic Masterpiece"
  },
  {
    "title": "Kingdom of the Planet of the Apes",
    "year": 2024,
    "rating": 7.1,
    "duration": "2h 25m",
    "genres": [
      "Sci-Fi",
      "Action",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/fqv8v6AycXKsivp1T5yKtLbGXce.jpg",
      "publicId": null
    },
    "youtubeId": "vqm8AJyO43w",
    "synopsis": "Many years after the reign of Caesar, a young ape embarks on a journey that leads him to question everything he was taught about the past and to make choices that define the future.",
    "cast": [
      "Owen Teague",
      "Freya Allan",
      "Kevin Durand",
      "Peter Macon"
    ],
    "director": "Wes Ball",
    "smartLabel": "Sci-Fi Epic"
  },
  {
    "title": "Everything Everywhere All at Once",
    "year": 2022,
    "rating": 7.8,
    "duration": "2h 19m",
    "genres": [
      "Sci-Fi",
      "Comedy",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/fIwiFha3WPu5nHkBeMQ4GzEk0Hv.jpg",
      "publicId": null
    },
    "youtubeId": "wxN1T1uxQ2g",
    "synopsis": "An aging Chinese immigrant is swept up in an insane adventure where she alone can save the world by exploring other universes and connecting with the lives she could have led.",
    "cast": [
      "Michelle Yeoh",
      "Ke Huy Quan",
      "Jamie Lee Curtis",
      "Stephanie Hsu"
    ],
    "director": "Daniel Kwan & Daniel Scheinert",
    "smartLabel": "Mind-Bending"
  },
  {
    "title": "Interstellar",
    "year": 2014,
    "rating": 8.7,
    "duration": "2h 49m",
    "genres": [
      "Sci-Fi",
      "Drama",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
      "publicId": null
    },
    "youtubeId": "zSWdZVtXT7E",
    "synopsis": "When Earth becomes uninhabitable, a farmer and ex-NASA pilot leads a mission through a wormhole to search for a new home for humanity, challenging the boundaries of space and time.",
    "cast": [
      "Matthew McConaughey",
      "Anne Hathaway",
      "Jessica Chastain",
      "Michael Caine"
    ],
    "director": "Christopher Nolan",
    "smartLabel": "All-Time Classic"
  },
  {
    "title": "Guardians of the Galaxy Vol. 3",
    "year": 2023,
    "rating": 7.9,
    "duration": "2h 30m",
    "genres": [
      "Action",
      "Adventure",
      "Sci-Fi"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
      "publicId": null
    },
    "youtubeId": "u3V5KDHRQvk",
    "synopsis": "Still reeling from the loss of Gamora, Peter Quill rallies his team to protect Rocket from a dangerous new enemy — a mission that could lead to the end of the Guardians as we know them.",
    "cast": [
      "Chris Pratt",
      "Zoe Saldaña",
      "Bradley Cooper",
      "Vin Diesel"
    ],
    "director": "James Gunn",
    "smartLabel": "Emotional Blockbuster"
  },
  {
    "title": "The Batman",
    "year": 2022,
    "rating": 7.8,
    "duration": "2h 56m",
    "genres": [
      "Action",
      "Mystery",
      "Thriller"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
      "publicId": null
    },
    "youtubeId": "mqqft2x_Aa4",
    "synopsis": "When the Riddler begins murdering key political figures in Gotham, Batman investigates the city's hidden corruption and is forced to question his own family's dark history.",
    "cast": [
      "Robert Pattinson",
      "Zoë Kravitz",
      "Jeffrey Wright",
      "Colin Farrell"
    ],
    "director": "Matt Reeves",
    "smartLabel": "Dark and Gripping"
  },
  {
    "title": "Top Gun: Maverick",
    "year": 2022,
    "rating": 8.3,
    "duration": "2h 10m",
    "genres": [
      "Action",
      "Drama",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
      "publicId": null
    },
    "youtubeId": "qSqVVswa420",
    "synopsis": "After thirty years of service, Pete Mitchell is where he belongs — pushing the envelope as a test pilot. When called to train a new generation, he confronts the ghosts of his past.",
    "cast": [
      "Tom Cruise",
      "Miles Teller",
      "Jennifer Connelly",
      "Jon Hamm"
    ],
    "director": "Joseph Kosinski",
    "smartLabel": "Adrenaline Rush"
  },
  {
    "title": "Avatar: The Way of Water",
    "year": 2022,
    "rating": 7.6,
    "duration": "3h 12m",
    "genres": [
      "Action",
      "Sci-Fi",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/5gPQKfFJnl8d1edbkOzKONo4mnr.jpg",
      "publicId": null
    },
    "youtubeId": "d9MyW72ELq0",
    "synopsis": "Jake Sully lives with his family on Pandora. When a familiar threat returns, Jake must work with Neytiri and the Na'vi race to protect their planet and everything they love.",
    "cast": [
      "Sam Worthington",
      "Zoe Saldaña",
      "Sigourney Weaver",
      "Kate Winslet"
    ],
    "director": "James Cameron",
    "smartLabel": "Visual Spectacle"
  },
  {
    "title": "Glass Onion: A Knives Out Mystery",
    "year": 2022,
    "rating": 7.1,
    "duration": "2h 19m",
    "genres": [
      "Mystery",
      "Comedy",
      "Thriller"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/e782pDRAlu4BG0ahd777n8zfPzZ.jpg",
      "publicId": null
    },
    "youtubeId": "gj5ibYSz8C0",
    "synopsis": "Detective Benoit Blanc travels to Greece to unravel the layers of a mystery surrounding a tech billionaire and his carefully curated group of friends on a private island.",
    "cast": [
      "Daniel Craig",
      "Edward Norton",
      "Janelle Monáe",
      "Kate Hudson"
    ],
    "director": "Rian Johnson",
    "smartLabel": "Whodunit Delight"
  },
  {
    "title": "Oppenheimer",
    "year": 2023,
    "rating": 8.3,
    "duration": "3h 0m",
    "genres": [
      "Mystery",
      "Drama",
      "History"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
      "publicId": null
    },
    "youtubeId": "uYPbbksJxIg",
    "synopsis": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, told through the lens of his subsequent security hearing.",
    "cast": [
      "Cillian Murphy",
      "Emily Blunt",
      "Matt Damon",
      "Robert Downey Jr."
    ],
    "director": "Christopher Nolan",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "Twisters",
    "year": 2024,
    "rating": 7.2,
    "duration": "2h 2m",
    "genres": [
      "Thriller",
      "Action",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/58D6ZAvOKxlHjyX9S8qNKSBE9Y.jpg",
      "publicId": null
    },
    "youtubeId": "aHEgtXhOQRQ",
    "synopsis": "Storm chasers race across the Great Plains to test a new system that could neutralize the destructive power of tornadoes, while competing agendas put everyone at risk.",
    "cast": [
      "Daisy Edgar-Jones",
      "Glen Powell",
      "Anthony Ramos",
      "Maura Tierney"
    ],
    "director": "Lee Isaac Chung",
    "smartLabel": "Edge of Your Seat"
  },
  {
    "title": "Mission: Impossible – Dead Reckoning Part One",
    "year": 2023,
    "rating": 7.7,
    "duration": "2h 43m",
    "genres": [
      "Thriller",
      "Action",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
      "publicId": null
    },
    "youtubeId": "avz06PDqDbM",
    "synopsis": "Ethan Hunt and his IMF team must track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands. Every nation in the world is now a target.",
    "cast": [
      "Tom Cruise",
      "Hayley Atwell",
      "Ving Rhames",
      "Simon Pegg"
    ],
    "director": "Christopher McQuarrie",
    "smartLabel": "Non-Stop Action"
  },
  {
    "title": "Barbie",
    "year": 2023,
    "rating": 6.9,
    "duration": "1h 54m",
    "genres": [
      "Drama",
      "Comedy",
      "Fantasy"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/3N5QNUqS76GFYNoEayfkkJyAyTN.jpg",
      "publicId": null
    },
    "youtubeId": "sz5O4too0ss",
    "synopsis": "Barbie suffers a crisis that leads her to question her world and her existence. She and Ken go on a journey of self-discovery in the real world, confronting reality and identity.",
    "cast": [
      "Margot Robbie",
      "Ryan Gosling",
      "America Ferrera",
      "Kate McKinnon"
    ],
    "director": "Greta Gerwig",
    "smartLabel": "Cultural Phenomenon"
  },
  {
    "title": "The Holdovers",
    "year": 2023,
    "rating": 8,
    "duration": "2h 13m",
    "genres": [
      "Drama",
      "Comedy"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdac.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/A99WMiz0ASpH9coOFrxSEuwTWx0.jpg",
      "publicId": null
    },
    "youtubeId": "YTLQW_Ic5K4",
    "synopsis": "A curmudgeonly instructor at a New England prep school is forced to remain on campus during the Christmas break to look after a handful of students with nowhere to go — a holiday none of them will forget.",
    "cast": [
      "Paul Giamatti",
      "Dominic Sessa",
      "Da'Vine Joy Randolph",
      "Carrie Preston"
    ],
    "director": "Alexander Payne",
    "smartLabel": "Hidden Gem"
  },
  {
    "title": "Wicked",
    "year": 2024,
    "rating": 7.7,
    "duration": "2h 40m",
    "genres": [
      "Fantasy",
      "Musical",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/uKb22E0nlzr914bA9KyA5CVCOlV.jpg",
      "publicId": null
    },
    "youtubeId": "vt98AlBDI9Y",
    "synopsis": "The story of the Witches of Oz — the unlikely friendship between Elphaba and Glinda, before Dorothy ever arrived in Oz. Their lives intertwine in ways that change them both forever.",
    "cast": [
      "Cynthia Erivo",
      "Ariana Grande",
      "Jeff Goldblum",
      "Jonathan Bailey"
    ],
    "director": "Jon M. Chu",
    "smartLabel": "Spectacular Musical"
  },
  {
    "title": "The Northman",
    "year": 2022,
    "rating": 7.1,
    "duration": "2h 17m",
    "genres": [
      "Fantasy",
      "Action",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/zhLKlUaF1SEpO58ppHIAyENkwgw.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/fqw8nJLPRgKRyFSDC0xBsC06NGC.jpg",
      "publicId": null
    },
    "youtubeId": "oMSdFM12hOw",
    "synopsis": "From the director of The Witch, a Norse Viking epic about a young prince on a quest to avenge his father's murder, inspired by the legend that influenced Shakespeare's Hamlet.",
    "cast": [
      "Alexander Skarsgård",
      "Nicole Kidman",
      "Anya Taylor-Joy",
      "Willem Dafoe"
    ],
    "director": "Robert Eggers",
    "smartLabel": "Epic Dark Fantasy"
  }
];

export async function seedMoviesProduction({ shouldConnect = true } = {}) {
  try {
    if (shouldConnect) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/StreamFlix';
      await mongoose.connect(mongoUri);
    }
    
    console.log('Seeding corrected movie database catalog...');
    await Movie.deleteMany({});
    console.log('Cleared existing movies.');
    
    await Movie.insertMany(movieCatalog);
    console.log(`Successfully seeded ${movieCatalog.length} movies.`);
    
    if (shouldConnect) {
      await mongoose.disconnect();
    }
    return { errorCount: 0 };
  } catch (err) {
    console.error('Seed error:', err);
    if (shouldConnect) {
      try { await mongoose.disconnect(); } catch (_) {}
    }
    throw err;
  }
}

import { fileURLToPath } from 'url';
const isMain = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('seedMoviesProduction.js')
);

if (isMain) {
  (async () => {
    try {
      await seedMoviesProduction({ shouldConnect: true });
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  })();
}

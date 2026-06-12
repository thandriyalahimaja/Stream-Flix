/**
 * StreamFlix — Production Movie Seed Script
 *
 * Generated from cleaned seed export.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Movie from '../models/Movie.js';

export const CURRENT_SEED_VERSION = '2026-06-streamflix-v2';

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
      "Harvey Guill├⌐n",
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
      "Timoth├⌐e Chalamet",
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
      "Timoth├⌐e Chalamet",
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
    "synopsis": "Still reeling from the loss of Gamora, Peter Quill rallies his team to protect Rocket from a dangerous new enemy ΓÇö a mission that could lead to the end of the Guardians as we know them.",
    "cast": [
      "Chris Pratt",
      "Zoe Salda├▒a",
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
      "Zo├½ Kravitz",
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
    "synopsis": "After thirty years of service, Pete Mitchell is where he belongs ΓÇö pushing the envelope as a test pilot. When called to train a new generation, he confronts the ghosts of his past.",
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
      "Zoe Salda├▒a",
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
      "Janelle Mon├íe",
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
    "title": "Mission: Impossible ΓÇô Dead Reckoning Part One",
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
    "synopsis": "A curmudgeonly instructor at a New England prep school is forced to remain on campus during the Christmas break to look after a handful of students with nowhere to go ΓÇö a holiday none of them will forget.",
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
    "synopsis": "The story of the Witches of Oz ΓÇö the unlikely friendship between Elphaba and Glinda, before Dorothy ever arrived in Oz. Their lives intertwine in ways that change them both forever.",
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
      "Alexander Skarsg├Ñrd",
      "Nicole Kidman",
      "Anya Taylor-Joy",
      "Willem Dafoe"
    ],
    "director": "Robert Eggers",
    "smartLabel": "Epic Dark Fantasy"
  },
  {
    "title": "The Dark Knight",
    "year": 2008,
    "rating": 8.5,
    "duration": "2h 32m",
    "genres": [
      "Action",
      "Crime",
      "Drama",
      "Thriller"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/nMKdUFKfhBhqIoMuAFPMIZQlGDd.jpg",
      "publicId": null
    },
    "youtubeId": "EXeTwQWrcwY",
    "synopsis": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    "cast": [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Michael Caine"
    ],
    "director": "Christopher Nolan",
    "smartLabel": "All-Time Classic"
  },
  {
    "title": "Inception",
    "year": 2010,
    "rating": 8.4,
    "duration": "2h 28m",
    "genres": [
      "Action",
      "Science Fiction",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
      "publicId": null
    },
    "youtubeId": "YoHD9XEInc0",
    "synopsis": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
    "cast": [
      "Leonardo DiCaprio",
      "Joseph Gordon-Levitt",
      "Elliot Page",
      "Tom Hardy"
    ],
    "director": "Christopher Nolan",
    "smartLabel": "Must Watch"
  },
  {
    "title": "The Godfather",
    "year": 1972,
    "rating": 8.7,
    "duration": "2h 55m",
    "genres": [
      "Drama",
      "Crime"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLlegkIl1Phs.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
      "publicId": null
    },
    "youtubeId": "1x0GpEZnwa8",
    "synopsis": "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime patriarch Vito Corleone barely survives an attempt on his life, his youngest son Michael steps in to take care of the would-be killers.",
    "cast": [
      "Marlon Brando",
      "Al Pacino",
      "James Caan",
      "Robert Duvall"
    ],
    "director": "Francis Ford Coppola",
    "smartLabel": "All-Time Classic"
  },
  {
    "title": "Schindler's List",
    "year": 1993,
    "rating": 8.6,
    "duration": "3h 15m",
    "genres": [
      "Drama",
      "History",
      "War"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg",
      "publicId": null
    },
    "youtubeId": "gG22XNhtnoY",
    "synopsis": "The true story of how businessman Oskar Schindler saved over a thousand mostly Polish-Jewish refugees from the Holocaust by employing them in his factories during World War II.",
    "cast": [
      "Liam Neeson",
      "Ralph Fiennes",
      "Ben Kingsley",
      "Caroline Goodall"
    ],
    "director": "Steven Spielberg",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "Forrest Gump",
    "year": 1994,
    "rating": 8.5,
    "duration": "2h 22m",
    "genres": [
      "Comedy",
      "Drama",
      "Romance"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/qdIMHd4sEfJSckfVJfKQvisL02a.jpg",
      "publicId": null
    },
    "youtubeId": "eYSnxZKTZzU",
    "synopsis": "A man with a low IQ has accomplished great things in his life and been present during significant historic events — in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.",
    "cast": [
      "Tom Hanks",
      "Robin Wright",
      "Gary Sinise",
      "Sally Field"
    ],
    "director": "Robert Zemeckis",
    "smartLabel": "Audience Favourite"
  },
  {
    "title": "Spirited Away",
    "year": 2001,
    "rating": 8.5,
    "duration": "2h 5m",
    "genres": [
      "Animation",
      "Family",
      "Fantasy"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg",
      "publicId": null
    },
    "youtubeId": "ByXuk9QqQkk",
    "synopsis": "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
    "cast": [
      "Daveigh Chase",
      "Suzanne Pleshette",
      "Miyu Irino",
      "Rumi Hiiragi"
    ],
    "director": "Hayao Miyazaki",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "Dangal",
    "year": 2016,
    "rating": 8.3,
    "duration": "2h 41m",
    "genres": [
      "Action",
      "Biography",
      "Drama",
      "Sport"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/yAFyKNR4QwvLqhJFoOBMTl6YoA5.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/cGOPbv9wA5gEejkUN892eLZILteI.jpg",
      "publicId": null
    },
    "youtubeId": "x_7YlGv9u1g",
    "synopsis": "Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita to become India's first world-class female wrestlers, challenging social norms and transforming his village's view of women.",
    "cast": [
      "Aamir Khan",
      "Fatima Sana Shaikh",
      "Sanya Malhotra",
      "Sakshi Tanwar"
    ],
    "director": "Nitesh Tiwari",
    "smartLabel": "Emotional Blockbuster"
  },
  {
    "title": "3 Idiots",
    "year": 2009,
    "rating": 8.4,
    "duration": "2h 50m",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/4KFtYPtHsSwn7A9KbNs0FKPmvDc.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/r7djkqXiXWlSnFnCMU9TGKdnLjr.jpg",
      "publicId": null
    },
    "youtubeId": "zIKu9k50SDo",
    "synopsis": "Two friends embark on a quest for a third friend, Rancho, leading them to recall their college days at the Imperial College of Engineering where they fight against an oppressive educational system.",
    "cast": [
      "Aamir Khan",
      "R. Madhavan",
      "Sharman Joshi",
      "Kareena Kapoor"
    ],
    "director": "Rajkumar Hirani",
    "smartLabel": "Audience Favourite"
  },
  {
    "title": "Avengers: Endgame",
    "year": 2019,
    "rating": 8.4,
    "duration": "3h 1m",
    "genres": [
      "Action",
      "Adventure",
      "Science Fiction"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
      "publicId": null
    },
    "youtubeId": "TcMBFSGVi1c",
    "synopsis": "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
    "cast": [
      "Robert Downey Jr.",
      "Chris Evans",
      "Mark Ruffalo",
      "Chris Hemsworth"
    ],
    "director": "Anthony Russo, Joe Russo",
    "smartLabel": "Action-Packed"
  },
  {
    "title": "RRR",
    "year": 2022,
    "rating": 7.8,
    "duration": "3h 7m",
    "genres": [
      "Action",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/nEufeZlyAsvmLX6JnHi9XMRR1RJ.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/xCZ9h47lUNstnOVN35hOwFJKHMR.jpg",
      "publicId": null
    },
    "youtubeId": "f_vbAtFSEc0",
    "synopsis": "A fictional story about two legendary Indian revolutionaries, Alluri Sitarama Raju and Komaram Bheem, and their journey before they started fighting for their country against the British Empire in the 1920s.",
    "cast": [
      "N. T. Rama Rao Jr.",
      "Ram Charan",
      "Alia Bhatt",
      "Ajay Devgn"
    ],
    "director": "S. S. Rajamouli",
    "smartLabel": "Action-Packed"
  },
  {
    "title": "Coco",
    "year": 2017,
    "rating": 8.4,
    "duration": "1h 45m",
    "genres": [
      "Animation",
      "Family",
      "Fantasy",
      "Music"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/askg3SMvhqEl4OL52YuvdtY40Yb.jpg",
      "publicId": null
    },
    "youtubeId": "xlnPHQ3TLX8",
    "synopsis": "Despite his family's ban on music, young Miguel dreams of becoming a celebrated musician. After a chance encounter lands him in the Land of the Dead, he must find legendary singer Ernesto de la Cruz and get his family's blessing before it is too late.",
    "cast": [
      "Anthony Gonzalez",
      "Gael García Bernal",
      "Benjamin Bratt",
      "Alanna Ubach"
    ],
    "director": "Lee Unkrich",
    "smartLabel": "Family Favourite"
  },
  {
    "title": "The Lion King",
    "year": 1994,
    "rating": 8.3,
    "duration": "1h 28m",
    "genres": [
      "Animation",
      "Family",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/sKCr78MXSuS2t0nk0k1eDzBpXjk.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/wXsQvli6tWqja51pYxXNG1LFIGV.jpg",
      "publicId": null
    },
    "youtubeId": "eHcZlPpNt0Q",
    "synopsis": "A young lion prince flees his kingdom after the murder of his father, only to learn the true meaning of responsibility and bravery as he returns to challenge the uncle who usurped his throne.",
    "cast": [
      "Matthew Broderick",
      "Jeremy Irons",
      "James Earl Jones",
      "Moira Kelly"
    ],
    "director": "Roger Allers, Rob Minkoff",
    "smartLabel": "All-Time Classic"
  },
  {
    "title": "Dilwale Dulhania Le Jayenge",
    "year": 1995,
    "rating": 8.1,
    "duration": "3h 9m",
    "genres": [
      "Comedy",
      "Drama",
      "Romance"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/kZINs43sGEsNYeDTX2i7Jk5RMkx.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/g3MqDGCnrCaLLbMjuBJxnGAHYIz.jpg",
      "publicId": null
    },
    "youtubeId": "c25GKl5VNeY",
    "synopsis": "When Raj and Simran fall in love during a whirlwind European trip, their joy is cut short when Simran's father insists she honour a long-standing betrothal back in India. Raj must win over her family before it is too late.",
    "cast": [
      "Shah Rukh Khan",
      "Kajol",
      "Amrish Puri",
      "Anupam Kher"
    ],
    "director": "Aditya Chopra",
    "smartLabel": "Audience Favourite"
  },
  {
    "title": "Gladiator",
    "year": 2000,
    "rating": 8.2,
    "duration": "2h 35m",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/6WBIzCgmDCYrqh64yDREGeDk9d3.jpg",
      "publicId": null
    },
    "youtubeId": "uvbavW31adA",
    "synopsis": "In 180 AD, a once-powerful Roman general is reduced to slavery after the corrupt new emperor murders his family. Fuelled by vengeance, he rises through the gladiatorial ranks to challenge the emperor himself.",
    "cast": [
      "Russell Crowe",
      "Joaquin Phoenix",
      "Connie Nielsen",
      "Oliver Reed"
    ],
    "director": "Ridley Scott",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "The Shawshank Redemption",
    "year": 1994,
    "rating": 8.7,
    "duration": "2h 22m",
    "genres": [
      "Drama",
      "Crime"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
      "publicId": null
    },
    "youtubeId": "NmzuHjWmXOc",
    "synopsis": "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates for his integrity and unquenchable sense of hope.",
    "cast": [
      "Tim Robbins",
      "Morgan Freeman",
      "Bob Gunton",
      "William Sadler"
    ],
    "director": "Frank Darabont",
    "smartLabel": "Top Rated All-Time"
  },
  {
    "title": "The Lord of the Rings: The Return of the King",
    "year": 2003,
    "rating": 8.5,
    "duration": "3h 21m",
    "genres": [
      "Adventure",
      "Fantasy",
      "Action"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      "publicId": null
    },
    "youtubeId": "r5X-hFf6Bwo",
    "synopsis": "Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor from Sauron's forces. Meanwhile, Frodo and Sam bring the One Ring closer to the heart of Mordor.",
    "cast": [
      "Elijah Wood",
      "Ian McKellen",
      "Viggo Mortensen",
      "Orlando Bloom"
    ],
    "director": "Peter Jackson",
    "smartLabel": "Epic Masterpiece"
  },
  {
    "title": "The Prestige",
    "year": 2006,
    "rating": 8.5,
    "duration": "2h 10m",
    "genres": [
      "Drama",
      "Mystery",
      "Sci-Fi"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/bdN3gXuIZYaJP6ptpBzIISUCqhJ.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/j3wO0i6HGiJmDBiuVDakbEPxYDj.jpg",
      "publicId": null
    },
    "youtubeId": "RLtaA9fFNXU",
    "synopsis": "An intense rivalry develops between two companion magicians in turn-of-the-century London. Driven by a desire to outdo each other, they engage in a competitive struggle for supremacy that escalates with dangerous, life-altering consequences.",
    "cast": [
      "Hugh Jackman",
      "Christian Bale",
      "Michael Caine",
      "Scarlett Johansson"
    ],
    "director": "Christopher Nolan",
    "smartLabel": "Mind-Bending Thriller"
  },
  {
    "title": "The Matrix",
    "year": 1999,
    "rating": 8.2,
    "duration": "2h 16m",
    "genres": [
      "Action",
      "Sci-Fi"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
      "publicId": null
    },
    "youtubeId": "vKQi3bBA1y8",
    "synopsis": "A computer hacker learns from mysterious rebels about the true nature of his reality and his critical role in the ongoing war against its dystopian controllers.",
    "cast": [
      "Keanu Reeves",
      "Laurence Fishburne",
      "Carrie-Anne Moss",
      "Hugo Weaving"
    ],
    "director": "Lana Wachowski",
    "smartLabel": "Sci-Fi Cult Classic"
  },
  {
    "title": "Saving Private Ryan",
    "year": 1998,
    "rating": 8.2,
    "duration": "2h 49m",
    "genres": [
      "Drama",
      "History",
      "War"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/sGX3rlj18ATqnwMQ3cR78cSLwMr.jpg",
      "publicId": null
    },
    "youtubeId": "9CiW_DgxCnQ",
    "synopsis": "Following the Normandy Landings, a group of US soldiers go behind enemy lines to retrieve a paratrooper whose brothers have all been killed in action.",
    "cast": [
      "Tom Hanks",
      "Tom Sizemore",
      "Edward Burns",
      "Matt Damon"
    ],
    "director": "Steven Spielberg",
    "smartLabel": "Essential War Cinema"
  },
  {
    "title": "Whiplash",
    "year": 2014,
    "rating": 8.4,
    "duration": "1h 47m",
    "genres": [
      "Drama",
      "Music"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/6bbZ6XyvgfjhQwbplnUh1LSj1ue.jpg",
      "publicId": null
    },
    "youtubeId": "7d_jQycdQGo",
    "synopsis": "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's full potential.",
    "cast": [
      "Miles Teller",
      "J.K. Simmons",
      "Paul Reiser",
      "Melissa Benoist"
    ],
    "director": "Damien Chazelle",
    "smartLabel": "Intense & Riveting"
  },
  {
    "title": "Joker",
    "year": 2019,
    "rating": 8.2,
    "duration": "2h 2m",
    "genres": [
      "Crime",
      "Thriller",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg",
      "publicId": null
    },
    "youtubeId": "t433PEQGErc",
    "synopsis": "During the 1980s, a failed stand-up comedian driven insane by society turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic figure.",
    "cast": [
      "Joaquin Phoenix",
      "Robert De Niro",
      "Zazie Beetz",
      "Frances Conroy"
    ],
    "director": "Todd Phillips",
    "smartLabel": "Academy Award Winner"
  },
  {
    "title": "Mad Max: Fury Road",
    "year": 2015,
    "rating": 7.6,
    "duration": "2h 0m",
    "genres": [
      "Action",
      "Adventure",
      "Sci-Fi"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/phszHPFzxBZpFwTQZ69tGzECWkO.jpg",
      "publicId": null
    },
    "youtubeId": "hEJnMQG9ev8",
    "synopsis": "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.",
    "cast": [
      "Tom Hardy",
      "Charlize Theron",
      "Nicholas Hoult",
      "Hugh Keays-Byrne"
    ],
    "director": "George Miller",
    "smartLabel": "Action Masterclass"
  },
  {
    "title": "Zindagi Na Milegi Dobara",
    "year": 2011,
    "rating": 8,
    "duration": "2h 35m",
    "genres": [
      "Drama",
      "Comedy",
      "Romance"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/7f8FhVSbFcEb8XPxEWAGTLPdNmo.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/imgVb8QZzIuKAnBclwz1QOnnLRE.jpg",
      "publicId": null
    },
    "youtubeId": "ifIBOKCfjVs",
    "synopsis": "Three friends take a vacation in Spain before one of them gets married. The trip becomes an opportunity to mend fences, overcome their deep-seated fears, and fall in love with life all over again.",
    "cast": [
      "Hrithik Roshan",
      "Farhan Akhtar",
      "Abhay Deol",
      "Katrina Kaif"
    ],
    "director": "Zoya Akhtar",
    "smartLabel": "Bollywood Classic"
  },
  {
    "title": "Andhadhun",
    "year": 2018,
    "rating": 8.2,
    "duration": "2h 19m",
    "genres": [
      "Crime",
      "Thriller",
      "Comedy"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/1Ni73fD6r47fGgOiaJ1UfFvO5gV.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/w8G9mF64v4Tepb4k93Zg7R6hOn6.jpg",
      "publicId": null
    },
    "youtubeId": "yNc_9JgV1KU",
    "synopsis": "A blind pianist's life takes a chaotic turn when he accidentally reports a murder that he never actually saw, setting off a wild chain of deceptive events.",
    "cast": [
      "Ayushmann Khurrana",
      "Tabu",
      "Radhika Apte",
      "Anil Dhawan"
    ],
    "director": "Sriram Raghavan",
    "smartLabel": "Must-Watch Thriller"
  },
  {
    "title": "Lagaan",
    "year": 2001,
    "rating": 7.9,
    "duration": "3h 44m",
    "genres": [
      "Drama",
      "History",
      "Musical"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/jVymxX3Yh9oR9f71b9S4Fv9uS1w.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/5z6XbK3f7l7R7w7wV6B5wV6B5w.jpg",
      "publicId": null
    },
    "youtubeId": "oSIGQ0YkFxs",
    "synopsis": "In Victorian India, a resilient village stakes its entire future on a high-stakes game of cricket against their arrogant British rulers to avoid paying an oppressive tax burden.",
    "cast": [
      "Aamir Khan",
      "Gracy Singh",
      "Rachel Shelley",
      "Paul Blackthorne"
    ],
    "director": "Ashutosh Gowariker",
    "smartLabel": "Oscar Nominated"
  },
  {
    "title": "Taare Zameen Par",
    "year": 2007,
    "rating": 8,
    "duration": "2h 45m",
    "genres": [
      "Drama",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/99uV4zU7K9OQ6B2Gk7XyPnmh6wD.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/7mSg2f8G8p2V0kK3fL9X9M7b6jK.jpg",
      "publicId": null
    },
    "youtubeId": "tn_2Ie_jtX8",
    "synopsis": "An unconventional art teacher helps an imaginative eight-year-old boy discover his true academic potential and artistic brilliance after he is sent away to a strict boarding school.",
    "cast": [
      "Darsheel Safary",
      "Aamir Khan",
      "Tisca Chopra",
      "Vipin Sharma"
    ],
    "director": "Aamir Khan",
    "smartLabel": "Heartwarming Masterpiece"
  },
  {
    "title": "Spider-Man: Into the Spider-Verse",
    "year": 2018,
    "rating": 8.4,
    "duration": "1h 57m",
    "genres": [
      "Animation",
      "Action",
      "Adventure"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/ii0Y6p3szg9vI6Yflg6796mSgXo.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/7d686gU9g7gY89x9g7Y89x9g7Y8.jpg",
      "publicId": null
    },
    "youtubeId": "pmx7MCyNj7E",
    "synopsis": "Teen Miles Morales becomes the Spider-Man of his universe and must join forces with five spider-powered individuals from other dimensions to stop a threat that endangers all realities.",
    "cast": [
      "Shameik Moore",
      "Jake Johnson",
      "Hailee Steinfeld",
      "Mahershala Ali"
    ],
    "director": "Bob Tourtelot",
    "smartLabel": "Visual Masterpiece"
  },
  {
    "title": "Up",
    "year": 2009,
    "rating": 8,
    "duration": "1h 36m",
    "genres": [
      "Animation",
      "Comedy",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/vp628CHY6bB96Zp66Xv7XfTq6X6.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/6McwYwH8qL8yO9G9X6mSgTq6X6.jpg",
      "publicId": null
    },
    "youtubeId": "AkdXuDAP2Ts",
    "synopsis": "78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with thousands of balloons, inadvertently taking a young, over-eager wilderness explorer along for the journey.",
    "cast": [
      "Ed Asner",
      "Christopher Plummer",
      "Jordan Nagai",
      "Bob Peterson"
    ],
    "director": "Pete Docter",
    "smartLabel": "Pixar Classic"
  },
  {
    "title": "WALL-E",
    "year": 2008,
    "rating": 8,
    "duration": "1h 38m",
    "genres": [
      "Animation",
      "Family",
      "Sci-Fi"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/9cK7w9gfgfgfgfgfgfgfgfgfgf.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/8w0w9w9w9w9w9w9w9w9w9w9w9w.jpg",
      "publicId": null
    },
    "youtubeId": "alIq_wG9FNk",
    "synopsis": "In the distant future, a small, lonely waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the mechanical and biological fate of mankind.",
    "cast": [
      "Ben Burtt",
      "Elissa Knight",
      "Jeff Garlin",
      "Fred Willard"
    ],
    "director": "Andrew Stanton",
    "smartLabel": "Sci-Fi Masterpiece"
  },
  {
    "title": "The Green Mile",
    "year": 1999,
    "rating": 8.5,
    "duration": "3h 9m",
    "genres": [
      "Fantasy",
      "Drama",
      "Crime"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/velWPhVR2HiECdBohArJXVMhY7c.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/l6hQWH9eDksNJNiXWYRkWqikOdu.jpg",
      "publicId": null
    },
    "youtubeId": "Ki4haFrqSrw",
    "synopsis": "A death row corrections officer at Cold Mountain Penitentiary discovers that one of his inmates, a gentle giant named John Coffey, possesses an extraordinary supernatural gift. As the execution date approaches, Paul Edgecomb must grapple with the moral weight of his duty against the miraculous power he witnesses.",
    "cast": [
      "Tom Hanks",
      "Michael Clarke Duncan",
      "David Morse",
      "Bonnie Hunt"
    ],
    "director": "Frank Darabont",
    "smartLabel": "All-Time Classic"
  },
  {
    "title": "Fight Club",
    "year": 1999,
    "rating": 8.4,
    "duration": "2h 19m",
    "genres": [
      "Drama",
      "Thriller"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
      "publicId": null
    },
    "youtubeId": "qtRKdVHc-cE",
    "synopsis": "An insomniac office worker, searching for a way to change his life, crosses paths with a soap-selling devil-may-care figure and forms an underground fight club. What begins as bare-knuckle brawls spirals into a radical liberation movement that blurs the line between chaos and freedom.",
    "cast": [
      "Brad Pitt",
      "Edward Norton",
      "Helena Bonham Carter",
      "Meat Loaf"
    ],
    "director": "David Fincher",
    "smartLabel": "Audience Favourite"
  },
  {
    "title": "Se7en",
    "year": 1995,
    "rating": 8.3,
    "duration": "2h 7m",
    "genres": [
      "Crime",
      "Mystery",
      "Thriller"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/jXgjgPjAzTNWFmBquodCFYxfY4z.jpg",
      "publicId": null
    },
    "youtubeId": "znmZoVkCjpI",
    "synopsis": "Two detectives — a seasoned veteran nearing retirement and an idealistic rookie — hunt a meticulous serial killer who uses the seven deadly sins as the blueprint for a series of gruesome murders. As they close in on the killer, they find themselves drawn into a diabolical endgame.",
    "cast": [
      "Brad Pitt",
      "Morgan Freeman",
      "Gwyneth Paltrow",
      "Kevin Spacey"
    ],
    "director": "David Fincher",
    "smartLabel": "Must Watch"
  },
  {
    "title": "Django Unchained",
    "year": 2012,
    "rating": 8.2,
    "duration": "2h 45m",
    "genres": [
      "Drama",
      "Western"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWAn9L.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/2EKdgduWZeAdsxDcxSKlMbhzS0.jpg",
      "publicId": null
    },
    "youtubeId": "0fUCuvNlOCg",
    "synopsis": "In the antebellum South, a freed slave named Django teams up with a German bounty hunter on a bloody journey to rescue his wife from the clutches of a brutal Mississippi plantation owner. Quentin Tarantino's genre-defying revenge epic blends spaghetti western, blaxploitation, and operatic violence.",
    "cast": [
      "Jamie Foxx",
      "Christoph Waltz",
      "Leonardo DiCaprio",
      "Kerry Washington"
    ],
    "director": "Quentin Tarantino",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "The Wolf of Wall Street",
    "year": 2013,
    "rating": 8,
    "duration": "3h 0m",
    "genres": [
      "Crime",
      "Drama",
      "Comedy"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/sD9iyJMzGEJi5ZEk0nVsK1tqBY.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg",
      "publicId": null
    },
    "youtubeId": "idAVRvQeYAE",
    "synopsis": "Based on the true story of Jordan Belfort, a New York stockbroker who runs a company engaged in securities fraud and corruption on a staggering scale. Martin Scorsese's exhilarating chronicle of excess, greed, and debauchery follows Belfort's rise and spectacular fall.",
    "cast": [
      "Leonardo DiCaprio",
      "Jonah Hill",
      "Margot Robbie",
      "Matthew McConaughey"
    ],
    "director": "Martin Scorsese",
    "smartLabel": "Audience Favourite"
  },
  {
    "title": "Shutter Island",
    "year": 2010,
    "rating": 8.1,
    "duration": "2h 18m",
    "genres": [
      "Thriller",
      "Mystery",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/6P6bsLDLMkBqnuobwXMnDqnVLHE.jpg",
      "publicId": null
    },
    "youtubeId": "RoE3rC8rouc",
    "synopsis": "In 1954, U.S. Marshal Teddy Daniels travels to Ashecliffe Hospital for the criminally insane on a remote island to investigate the mysterious disappearance of a patient. As the investigation deepens, Teddy begins to question his own sanity and the true nature of the institution.",
    "cast": [
      "Leonardo DiCaprio",
      "Mark Ruffalo",
      "Ben Kingsley",
      "Michelle Williams"
    ],
    "director": "Martin Scorsese",
    "smartLabel": "Must Watch"
  },
  {
    "title": "The Truman Show",
    "year": 1998,
    "rating": 8.1,
    "duration": "1h 43m",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/vuza0WqY239yBXOadKlGwJsZJFE.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/bMSMpTzOSMi08JJM2P5K4MxKAkE.jpg",
      "publicId": null
    },
    "youtubeId": "dlnmQbPGuls",
    "synopsis": "Truman Burbank leads a seemingly perfect life in the idyllic town of Seahaven — unaware that his entire existence is a live television broadcast watched by millions and that everyone around him is an actor. When cracks begin to appear in his reality, Truman starts a desperate search for the truth.",
    "cast": [
      "Jim Carrey",
      "Ed Harris",
      "Laura Linney",
      "Natascha McElhone"
    ],
    "director": "Peter Weir",
    "smartLabel": "All-Time Classic"
  },
  {
    "title": "PK",
    "year": 2014,
    "rating": 8.1,
    "duration": "2h 33m",
    "genres": [
      "Comedy",
      "Drama",
      "Science Fiction"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/8tJ4qOFoJVDvBLp7mNIhJH1LxFa.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/MfJdnQTcRZ6naBP5Sms7p5oBmE.jpg",
      "publicId": null
    },
    "youtubeId": "SOXWc32k4zA",
    "synopsis": "An alien who lands on Earth and loses his only means of returning home embarks on a journey across India to find it, along the way questioning the hypocrisy of religious rituals and dogma. A journalist helps him in his quest while both discover unexpected truths about faith, love, and humanity.",
    "cast": [
      "Aamir Khan",
      "Anushka Sharma",
      "Sushant Singh Rajput",
      "Boman Irani"
    ],
    "director": "Rajkumar Hirani",
    "smartLabel": "Audience Favourite"
  },
  {
    "title": "Bhaag Milkha Bhaag",
    "year": 2013,
    "rating": 8.2,
    "duration": "3h 6m",
    "genres": [
      "Biography",
      "Drama",
      "Sport"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/oJJQYAXz1MnNPdaT0eWaU7bVHU5.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/xJO5RiZ2OdnI8wy9nGTM1uZkCIg.jpg",
      "publicId": null
    },
    "youtubeId": "CL9XLw2bE8U",
    "synopsis": "The inspiring true story of Milkha Singh, India's legendary sprinter known as the Flying Sikh. Born into poverty and scarred by the horrors of Partition, Milkha rises through sheer determination to become one of the greatest athletes India has ever produced, competing on the world stage with his haunted past fueling his every stride.",
    "cast": [
      "Farhan Akhtar",
      "Sonam Kapoor",
      "Divya Dutta",
      "Art Malik"
    ],
    "director": "Rakeysh Omprakash Mehra",
    "smartLabel": "Emotional Blockbuster"
  },
  {
    "title": "Barfi!",
    "year": 2012,
    "rating": 8.1,
    "duration": "2h 31m",
    "genres": [
      "Comedy",
      "Drama",
      "Romance"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/gT0zFgzgOZnJBFqMH5UUQiDLaXb.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/n2xgoBJMZR7hqDTmQCqNfS4LR3q.jpg",
      "publicId": null
    },
    "youtubeId": "fDpjzEKJjsM",
    "synopsis": "Set in the vibrant hills of 1970s Darjeeling, a deaf-mute young man named Barfi! lives life with infectious joy and mischief, falling in love with two very different women — one neurotypical and one autistic. A visually rich, dialogue-light love story that celebrates imperfection and the language of the heart.",
    "cast": [
      "Ranbir Kapoor",
      "Priyanka Chopra",
      "Ileana D'Cruz",
      "Saurabh Shukla"
    ],
    "director": "Anurag Basu",
    "smartLabel": "Emotional Blockbuster"
  },
  {
    "title": "Swades",
    "year": 2004,
    "rating": 8,
    "duration": "3h 15m",
    "genres": [
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/dFHaJoqFKQBDsEi3HlKVdZgVWCD.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/6q5ZgaHSBJHjdqE3SgHTcbPPJK.jpg",
      "publicId": null
    },
    "youtubeId": "vc7AZNWvs0M",
    "synopsis": "A successful NASA scientist returns to India to bring his childhood nanny to America, but finds himself confronted with the stark realities of rural life. As he witnesses poverty, caste discrimination, and the absence of basic electricity, he is compelled to reconsider where he truly belongs.",
    "cast": [
      "Shah Rukh Khan",
      "Gayatri Joshi",
      "Kishori Ballal",
      "Rajesh Vivek"
    ],
    "director": "Ashutosh Gowariker",
    "smartLabel": "Must Watch"
  },
  {
    "title": "Drishyam",
    "year": 2015,
    "rating": 8.2,
    "duration": "2h 43m",
    "genres": [
      "Crime",
      "Drama",
      "Thriller"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/gLB3OxgZNWJWGgC7nmRHuAXVPVZ.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/lNhFCOCelXBpBCVK4FvwJqJaJY2.jpg",
      "publicId": null
    },
    "youtubeId": "64xJLmcA2K8",
    "synopsis": "A self-educated cable operator will go to any lengths to protect his family after they accidentally kill a young man who was blackmailing them. With a brilliant police inspector closing in, he orchestrates an airtight alibi that tests the limits of truth, perception, and justice.",
    "cast": [
      "Ajay Devgn",
      "Tabu",
      "Shriya Saran",
      "Ishita Dutta"
    ],
    "director": "Nishikant Kamat",
    "smartLabel": "Weekend Favourite"
  },
  {
    "title": "Ratatouille",
    "year": 2007,
    "rating": 8.1,
    "duration": "1h 51m",
    "genres": [
      "Animation",
      "Comedy",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/npHNjldbeTHdKKw28bJKs7lzqzj.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/bAlBZxCKUlbfDhINlIL5qPzHPqZ.jpg",
      "publicId": null
    },
    "youtubeId": "-tNqfcZKn6k",
    "synopsis": "Remy, a talented young rat with an extraordinary sense of taste and smell, dreams of becoming a chef in Paris. Forming an unlikely partnership with a bumbling kitchen worker at a legendary restaurant, he must hide his culinary genius while navigating the cutthroat world of haute cuisine.",
    "cast": [
      "Patton Oswalt",
      "Lou Romano",
      "Ian Holm",
      "Peter O'Toole"
    ],
    "director": "Brad Bird",
    "smartLabel": "Family Favourite"
  },
  {
    "title": "How to Train Your Dragon",
    "year": 2010,
    "rating": 8,
    "duration": "1h 38m",
    "genres": [
      "Animation",
      "Adventure",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/ygGmAO60t8GyqUKGfVWLZSnBahN.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/mRpQaMvFmfPMOUBGhkBJt3SBUhL.jpg",
      "publicId": null
    },
    "youtubeId": "2AKsAxrhqgM",
    "synopsis": "On a Viking island where dragon slaying is a rite of passage, a scrawny misfit named Hiccup unexpectedly befriends a wounded Night Fury dragon he names Toothless. Their secret bond challenges centuries of tradition and could change the fate of both their worlds forever.",
    "cast": [
      "Jay Baruchel",
      "Gerard Butler",
      "Craig Ferguson",
      "America Ferrera"
    ],
    "director": "Chris Sanders",
    "smartLabel": "Family Favourite"
  },
  {
    "title": "Toy Story 3",
    "year": 2010,
    "rating": 8.3,
    "duration": "1h 43m",
    "genres": [
      "Animation",
      "Comedy",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/AbbXspMOwdvwWZgVN0nabSoDZcn.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/oFEjRBCg4HVa0oJgKDfkRhLRlrB.jpg",
      "publicId": null
    },
    "youtubeId": "m52GPdlBj6I",
    "synopsis": "As Andy heads off to college, his beloved toys — Woody, Buzz, and the gang — are accidentally donated to a daycare center run by a deceptively sinister teddy bear. What follows is a high-stakes escape adventure filled with laughter, heartbreak, and a finale that will move audiences of all ages to tears.",
    "cast": [
      "Tom Hanks",
      "Tim Allen",
      "Joan Cusack",
      "Ned Beatty"
    ],
    "director": "Lee Unkrich",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "The Departed",
    "year": 2006,
    "rating": 8.5,
    "duration": "2h 31m",
    "genres": [
      "Crime",
      "Drama",
      "Thriller"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/8Op4q0jkHhBf3bOJdXOVFRSnJ9Q.jpg",
      "publicId": null
    },
    "youtubeId": "iQpb1LoeVUc",
    "synopsis": "An undercover state cop infiltrates an Irish gang while a mole within the police force works for the same mob. Both race to expose each other before their covers are blown in this tense cat-and-mouse crime thriller.",
    "cast": [
      "Leonardo DiCaprio",
      "Matt Damon",
      "Jack Nicholson",
      "Mark Wahlberg"
    ],
    "director": "Martin Scorsese",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "The Social Network",
    "year": 2010,
    "rating": 7.8,
    "duration": "2h 0m",
    "genres": [
      "Biography",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/lSzTDNrexSP8m0GxmqZvNvXfpQo.jpg",
      "publicId": null
    },
    "youtubeId": "lB95KLmpLR4",
    "synopsis": "Harvard student Mark Zuckerberg creates the social networking site that would become known as Facebook, but is later sued by two brothers who claimed he stole their idea, and the co-founder who was later squeezed out of the business.",
    "cast": [
      "Jesse Eisenberg",
      "Andrew Garfield",
      "Justin Timberlake",
      "Rooney Mara"
    ],
    "director": "David Fincher",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "Ford v Ferrari",
    "year": 2019,
    "rating": 8.1,
    "duration": "2h 32m",
    "genres": [
      "Action",
      "Biography",
      "Drama",
      "Sport"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfnVp17OgseidMFBq.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/6CoRTJTmijhBLJTUNoVSUNxZMEI.jpg",
      "publicId": null
    },
    "youtubeId": "zyYgDtY2AMY",
    "synopsis": "American car designer Carroll Shelby and fearless British driver Ken Miles battle corporate interference and the laws of physics to build a revolutionary race car for Ford and challenge Ferrari at the 24 Hours of Le Mans in 1966.",
    "cast": [
      "Matt Damon",
      "Christian Bale",
      "Jon Bernthal",
      "Caitriona Balfe"
    ],
    "director": "James Mangold",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "Blade Runner 2049",
    "year": 2017,
    "rating": 8,
    "duration": "2h 44m",
    "genres": [
      "Science Fiction",
      "Drama",
      "Mystery"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/sBC8QKPK9kFhkJeEU9rQXJhvVuW.jpg",
      "publicId": null
    },
    "youtubeId": "gCcx85zbxz4",
    "synopsis": "Thirty years after the events of the original, a new blade runner unearths a long-buried secret that plunges what remains of society into chaos, leading him to track down former blade runner Rick Deckard who has been missing for decades.",
    "cast": [
      "Ryan Gosling",
      "Harrison Ford",
      "Ana de Armas",
      "Sylvia Hoeks"
    ],
    "director": "Denis Villeneuve",
    "smartLabel": "Must Watch"
  },
  {
    "title": "The Martian",
    "year": 2015,
    "rating": 8,
    "duration": "2h 24m",
    "genres": [
      "Adventure",
      "Drama",
      "Science Fiction"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/5aGhaIHYuQbqlHWvWYqMCnj40y2.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/sy3e2e4JwdAtd2oZGA2uUilZe8j.jpg",
      "publicId": null
    },
    "youtubeId": "ej3ioOneTy8",
    "synopsis": "During a manned mission to Mars, astronaut Mark Watney is presumed dead after a fierce storm and left behind by his crew. With limited supplies, he must use his ingenuity to survive on the hostile planet while NASA and his crewmates work to bring him home.",
    "cast": [
      "Matt Damon",
      "Jessica Chastain",
      "Jeff Daniels",
      "Michael Peña"
    ],
    "director": "Ridley Scott",
    "smartLabel": "Audience Favourite"
  },
  {
    "title": "Arrival",
    "year": 2016,
    "rating": 7.9,
    "duration": "1h 56m",
    "genres": [
      "Drama",
      "Mystery",
      "Science Fiction"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/oiGIHpVhJhJXfznJctCqLPnMJep.jpg",
      "publicId": null
    },
    "youtubeId": "tFMo3UJ4B4g",
    "synopsis": "When mysterious spacecraft touch down across the globe, linguistics expert Louise Banks is recruited by the military to communicate with the alien visitors before a global catastrophe erupts, and discovers a profound truth that changes everything.",
    "cast": [
      "Amy Adams",
      "Jeremy Renner",
      "Forest Whitaker",
      "Michael Stuhlbarg"
    ],
    "director": "Denis Villeneuve",
    "smartLabel": "Emotional Blockbuster"
  },
  {
    "title": "Logan",
    "year": 2017,
    "rating": 8.1,
    "duration": "2h 17m",
    "genres": [
      "Action",
      "Drama",
      "Science Fiction"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/fnbjcRDYn6YviCcePDnGdyAkYsB.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/hSaH9tt67bozo9K50sbH0s4YjEc.jpg",
      "publicId": null
    },
    "youtubeId": "Div0iP65aZo",
    "synopsis": "In the near future, a weary and aging Logan cares for an ailing Professor X while protecting a young mutant girl being hunted by dark forces, embarking on one final, brutal road trip across a dystopian America.",
    "cast": [
      "Hugh Jackman",
      "Patrick Stewart",
      "Dafne Keen",
      "Boyd Holbrook"
    ],
    "director": "James Mangold",
    "smartLabel": "Emotional Blockbuster"
  },
  {
    "title": "Baahubali: The Beginning",
    "year": 2015,
    "rating": 8,
    "duration": "2h 39m",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/cNOSbCCMDxZFTxdG6yEEqjuHCmZ.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/4qmjBRHGdpMgzYb8mRBQDIV8J7Q.jpg",
      "publicId": null
    },
    "youtubeId": "sOEg_YZQsTI",
    "synopsis": "In ancient India, an adventurous and daring young man sets out to discover his true origins, leading to a legendary tale of a warrior prince and an epic war for the greatest kingdom ever known.",
    "cast": [
      "Prabhas",
      "Rana Daggubati",
      "Tamannaah Bhatia",
      "Anushka Shetty"
    ],
    "director": "S.S. Rajamouli",
    "smartLabel": "Action-Packed"
  },
  {
    "title": "Baahubali 2: The Conclusion",
    "year": 2017,
    "rating": 8.2,
    "duration": "2h 47m",
    "genres": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/qGWTqCQGVmZ2IQcb5GQDUqfGfDF.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/cUso8gy2Bz3FfXVvSFPJnV1aH0R.jpg",
      "publicId": null
    },
    "youtubeId": "G62HrubdD6o",
    "synopsis": "The mystery behind the murder of the great king Amarendra Baahubali is finally revealed, as his son Mahendra rises to reclaim his rightful place and avenge his father's death in an epic and emotional conclusion.",
    "cast": [
      "Prabhas",
      "Rana Daggubati",
      "Anushka Shetty",
      "Tamannaah Bhatia"
    ],
    "director": "S.S. Rajamouli",
    "smartLabel": "All-Time Classic"
  },
  {
    "title": "Gully Boy",
    "year": 2019,
    "rating": 7.9,
    "duration": "2h 34m",
    "genres": [
      "Drama",
      "Music"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/5g44XsyMJpSngEeOxpxaR4NzWwh.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/mVRXMHc2blMtMNBdUX7KuIGFsJ2.jpg",
      "publicId": null
    },
    "youtubeId": "JfbxcD6biOk",
    "synopsis": "A coming-of-age story set in the gritty lanes of Dharavi, Mumbai, following a young man from a slum who dares to dream big and uses underground rap music as his means to fight systemic poverty and societal oppression.",
    "cast": [
      "Ranveer Singh",
      "Alia Bhatt",
      "Siddhant Chaturvedi",
      "Kalki Koechlin"
    ],
    "director": "Zoya Akhtar",
    "smartLabel": "Audience Favourite"
  },
  {
    "title": "Chak De! India",
    "year": 2007,
    "rating": 8.1,
    "duration": "2h 29m",
    "genres": [
      "Drama",
      "Sport"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/b9hUbG4tkJFHyXYAJRDVVMHi4Jl.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w500/8E2sBz2GJSPH9Vf2VRJbQaMmx3Q.jpg",
      "publicId": null
    },
    "youtubeId": "6a0-dSMWm5g",
    "synopsis": "Former Indian hockey captain Kabir Khan, shunned by the nation over allegations of match-fixing, seeks redemption by coaching the underperforming Indian Women's National Hockey Team to glory at the World Cup.",
    "cast": [
      "Shah Rukh Khan",
      "Vidya Malvade",
      "Sagarika Ghatge",
      "Shilpa Shukla"
    ],
    "director": "Shimit Amin",
    "smartLabel": "Must Watch"
  },
  {
    "title": "Queen",
    "year": 2014,
    "rating": 8.1,
    "duration": "2h 26m",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/4KkMIRyIpSxXYKPFBAmKBJb07Cb.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/3yHXMHAXuDIpmO7R79EWHBqYFBT.jpg",
      "publicId": null
    },
    "youtubeId": "M_HP8xgXhBU",
    "synopsis": "A conservative Delhi girl's world falls apart when her fiancé calls off their wedding the day before. Refusing to cancel her honeymoon, she sets off alone to Paris and Amsterdam, embarking on a journey of self-discovery and liberation.",
    "cast": [
      "Kangana Ranaut",
      "Rajkummar Rao",
      "Lisa Haydon",
      "Mish Boyko"
    ],
    "director": "Vikas Bahl",
    "smartLabel": "Emotional Blockbuster"
  },
  {
    "title": "Kubo and the Two Strings",
    "year": 2016,
    "rating": 7.7,
    "duration": "1h 41m",
    "genres": [
      "Animation",
      "Action",
      "Adventure",
      "Family",
      "Fantasy"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/8eD8SeUGmIJgFlO6VxNMQKL5Zmm.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/oODmNXFMhq1gy3MJzFxDHRfMqfU.jpg",
      "publicId": null
    },
    "youtubeId": "9OzBRZT352Y",
    "synopsis": "A young boy with magical musical abilities must embark on a quest to find a legendary suit of armor once worn by his deceased father in order to defeat an evil spirit from the past in this stunning stop-motion adventure.",
    "cast": [
      "Art Parkinson",
      "Charlize Theron",
      "Matthew McConaughey",
      "Rooney Mara"
    ],
    "director": "Travis Knight",
    "smartLabel": "Family Favourite"
  },
  {
    "title": "The Incredibles",
    "year": 2004,
    "rating": 8,
    "duration": "1h 55m",
    "genres": [
      "Animation",
      "Action",
      "Adventure",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/2LqaLgk4Z226KkgPJuiOQ58VRHE.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/wa8onkImMXoFNxCFIEBniVbfSxY.jpg",
      "publicId": null
    },
    "youtubeId": "-UaGUdNJdRQ",
    "synopsis": "A family of undercover superheroes, while trying to live the quiet suburban life, are forced into action to save the world when a superhero-obsessed villain plots to eliminate all superpowers on Earth.",
    "cast": [
      "Craig T. Nelson",
      "Holly Hunter",
      "Samuel L. Jackson",
      "Jason Lee"
    ],
    "director": "Brad Bird",
    "smartLabel": "All-Time Classic"
  },
  {
    "title": "Finding Nemo",
    "year": 2003,
    "rating": 8.1,
    "duration": "1h 40m",
    "genres": [
      "Animation",
      "Adventure",
      "Comedy",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/2zh2ZqBsJFwgClO1v5PXCURRZuY.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/vgpXmVaVyUL7GGiDeiK1mKEKzcX.jpg",
      "publicId": null
    },
    "youtubeId": "WpOXa4uqqfA",
    "synopsis": "After his son Nemo is captured by a scuba diver and placed in a fish tank in a Sydney dentist's office, an overprotective clownfish named Marlin sets out on an epic cross-ocean journey to bring him home, aided by a forgetful fish named Dory.",
    "cast": [
      "Albert Brooks",
      "Ellen DeGeneres",
      "Alexander Gould",
      "Willem Dafoe"
    ],
    "director": "Andrew Stanton",
    "smartLabel": "Family Favourite"
  },
  {
    "title": "Titanic",
    "year": 1997,
    "rating": 7.9,
    "duration": "3h 14m",
    "genres": [
      "Drama",
      "Romance"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/1RZ1f3IKHMnItLMFmRuRMsRoXGe.jpg",
      "publicId": null
    },
    "youtubeId": "LuPB43YSgCs",
    "synopsis": "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic. Their romance blossoms even as the ship hurtles toward catastrophe.",
    "cast": [
      "Leonardo DiCaprio",
      "Kate Winslet",
      "Billy Zane",
      "Kathy Bates"
    ],
    "director": "James Cameron",
    "smartLabel": "All-Time Classic"
  },
  {
    "title": "The Silence of the Lambs",
    "year": 1991,
    "rating": 8.6,
    "duration": "1h 58m",
    "genres": [
      "Crime",
      "Drama",
      "Thriller"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/mfwq2nMBzArzQ7Y9RKE8SKeeTkg.jpg",
      "publicId": null
    },
    "youtubeId": "W6Mm8Sbe__o",
    "synopsis": "A young FBI trainee seeks the help of incarcerated cannibal Dr. Hannibal Lecter to track down a serial killer known as Buffalo Bill who skins his female victims.",
    "cast": [
      "Jodie Foster",
      "Anthony Hopkins",
      "Scott Glenn",
      "Ted Levine"
    ],
    "director": "Jonathan Demme",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "Good Will Hunting",
    "year": 1997,
    "rating": 8.3,
    "duration": "2h 6m",
    "genres": [
      "Drama",
      "Romance"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/bABCcRokAvbbzkynVxEN45Ykxkl.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/tc8aINn8y2IfKMOEEQZKGjBgL0B.jpg",
      "publicId": null
    },
    "youtubeId": "ReIJ1lbL-Q8",
    "synopsis": "Will Hunting, a janitor at MIT with a genius-level intellect, is discovered by a professor and paired with a therapist who helps him find direction and confront his troubled past.",
    "cast": [
      "Matt Damon",
      "Robin Williams",
      "Ben Affleck",
      "Minnie Driver"
    ],
    "director": "Gus Van Sant",
    "smartLabel": "Emotional Blockbuster"
  },
  {
    "title": "A Beautiful Mind",
    "year": 2001,
    "rating": 8.2,
    "duration": "2h 15m",
    "genres": [
      "Drama",
      "Biography"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/zwzWCmH72OSC9NA0ipoqynmrIA.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/l9M0bZSbXn8X2RPXJ28MkqBgJXL.jpg",
      "publicId": null
    },
    "youtubeId": "YWwAOutgWBQ",
    "synopsis": "The life story of John Nash, a brilliant mathematician who makes groundbreaking discoveries but descends into paranoid schizophrenia, and the love that ultimately helps him reclaim his life.",
    "cast": [
      "Russell Crowe",
      "Ed Harris",
      "Jennifer Connelly",
      "Paul Bettany"
    ],
    "director": "Ron Howard",
    "smartLabel": "Award-Winning"
  },
  {
    "title": "Catch Me If You Can",
    "year": 2002,
    "rating": 8.1,
    "duration": "2h 21m",
    "genres": [
      "Crime",
      "Drama",
      "Comedy"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/whrOSNfTgSBaL7FOTtGodNnQzlW.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/5g1naZCPsLBqHKiNaAckFtdOB7V.jpg",
      "publicId": null
    },
    "youtubeId": "71CLn8911W0",
    "synopsis": "Frank Abagnale Jr., before his 19th birthday, successfully cons millions of dollars as a Pan Am pilot, a doctor, and a legal prosecutor. FBI Agent Carl Hanratty makes it his life's mission to put him behind bars.",
    "cast": [
      "Leonardo DiCaprio",
      "Tom Hanks",
      "Christopher Walken",
      "Amy Adams"
    ],
    "director": "Steven Spielberg",
    "smartLabel": "Audience Favourite"
  },
  {
    "title": "Prisoners",
    "year": 2013,
    "rating": 8.2,
    "duration": "2h 33m",
    "genres": [
      "Crime",
      "Drama",
      "Mystery",
      "Thriller"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/oAisB65uKAKCDl0Y2MNPKKaGelR.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/iJvsNKRpVBDyOKVpFSzDEoT7dDH.jpg",
      "publicId": null
    },
    "youtubeId": "bpXfcTF6iVk",
    "synopsis": "When two young girls go missing, their desperate father takes matters into his own hands while a determined detective searches for the truth in this gripping thriller about justice, morality, and obsession.",
    "cast": [
      "Hugh Jackman",
      "Jake Gyllenhaal",
      "Viola Davis",
      "Paul Dano"
    ],
    "director": "Denis Villeneuve",
    "smartLabel": "Must Watch"
  },
  {
    "title": "Edge of Tomorrow",
    "year": 2014,
    "rating": 7.9,
    "duration": "1h 53m",
    "genres": [
      "Action",
      "Science Fiction"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/gsR4a4HLXR0JKkMWDlb1MpFdTjG.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/lCkbXGBxcEGMVjnPSb4iXMmZSaS.jpg",
      "publicId": null
    },
    "youtubeId": "vw61gCe2oqI",
    "synopsis": "A soldier caught in a time loop relives the same brutal battle against an alien invasion every day, gradually honing his combat skills alongside a legendary warrior to find a way to defeat the enemy.",
    "cast": [
      "Tom Cruise",
      "Emily Blunt",
      "Brendan Gleeson",
      "Bill Paxton"
    ],
    "director": "Doug Liman",
    "smartLabel": "Action-Packed"
  },
  {
    "title": "Uri: The Surgical Strike",
    "year": 2019,
    "rating": 8.2,
    "duration": "2h 18m",
    "genres": [
      "Action",
      "Drama",
      "History",
      "War"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/9HMb5MRMM5gqJIrN1M5GjHN2dFp.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/jf2T1BCWLKS24ELJq7jYMDtHzPh.jpg",
      "publicId": null
    },
    "youtubeId": "VVY3do673Zc",
    "synopsis": "Indian army special forces plan and execute a covert cross-border operation to avenge a deadly terrorist attack on an army base in Uri, in one of India's most daring military missions.",
    "cast": [
      "Vicky Kaushal",
      "Yami Gautam",
      "Paresh Rawal",
      "Kirti Kulhari"
    ],
    "director": "Aditya Dhar",
    "smartLabel": "Action-Packed"
  },
  {
    "title": "Kapoor & Sons",
    "year": 2016,
    "rating": 7.7,
    "duration": "2h 12m",
    "genres": [
      "Comedy",
      "Drama",
      "Family",
      "Romance"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/uEzXVwMLT9D4WfCHaOGWqRWpGGN.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/dI34PK8YVL1sCXCKbwOPbxNY0e.jpg",
      "publicId": null
    },
    "youtubeId": "s7YYt9_KfsM",
    "synopsis": "Two estranged brothers return home to their dysfunctional family in Coonoor when their grandfather falls ill, unearthing long-buried secrets, resentments, and a love triangle that threatens to tear them apart.",
    "cast": [
      "Sidharth Malhotra",
      "Alia Bhatt",
      "Fawad Khan",
      "Rishi Kapoor"
    ],
    "director": "Shakun Batra",
    "smartLabel": "Emotional Blockbuster"
  },
  {
    "title": "Rockstar",
    "year": 2011,
    "rating": 7.9,
    "duration": "2h 39m",
    "genres": [
      "Drama",
      "Music",
      "Romance"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/5aADWJDsejIJ8bgb1skLbsxBgdU.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/ypOSwZlLHBMpK7gN24HHkmDpw0.jpg",
      "publicId": null
    },
    "youtubeId": "bD5FShPZdpw",
    "synopsis": "A young Delhi boy chases his dream of becoming a rock star, transforms himself into the rebellious Jordan, and falls into a passionate but ill-fated love that fuels both his music and his destruction.",
    "cast": [
      "Ranbir Kapoor",
      "Nargis Fakhri",
      "Shammi Kapoor",
      "Kumud Mishra"
    ],
    "director": "Imtiaz Ali",
    "smartLabel": "Emotional Blockbuster"
  },
  {
    "title": "Munna Bhai M.B.B.S.",
    "year": 2003,
    "rating": 8.1,
    "duration": "2h 36m",
    "genres": [
      "Comedy",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/4Gc4yEKlHXWRHJMy5rLWU7ZFXH2.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/xz8rMYHqkQLMkzKz0lPhqEBPkYc.jpg",
      "publicId": null
    },
    "youtubeId": "6lCGvu-hwX4",
    "synopsis": "Munna Bhai, a lovable Mumbai gangster, impersonates a doctor to fulfil his parents' dreams and enrolls in medical college, where his unconventional methods of spreading love and joy transform everyone around him.",
    "cast": [
      "Sanjay Dutt",
      "Arshad Warsi",
      "Gracy Singh",
      "Boman Irani"
    ],
    "director": "Rajkumar Hirani",
    "smartLabel": "Audience Favourite"
  },
  {
    "title": "Hera Pheri",
    "year": 2000,
    "rating": 8.2,
    "duration": "2h 18m",
    "genres": [
      "Comedy",
      "Crime",
      "Drama"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/j75o6nLDqt3GR62PpJNuTGkSMHZ.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/6MKHgAzKf1X1KZPD7rdNQNLDhHU.jpg",
      "publicId": null
    },
    "youtubeId": "m1zMmVwWr-M",
    "synopsis": "Three unemployed, cash-strapped men accidentally intercept a ransom call meant for a kidnapper and hatch a hilarious scheme to claim the ransom money themselves with disastrously funny consequences.",
    "cast": [
      "Akshay Kumar",
      "Suniel Shetty",
      "Paresh Rawal",
      "Tabu"
    ],
    "director": "Priyadarshan",
    "smartLabel": "Weekend Favourite"
  },
  {
    "title": "Inside Out",
    "year": 2015,
    "rating": 8.1,
    "duration": "1h 35m",
    "genres": [
      "Animation",
      "Adventure",
      "Comedy",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/aAmfIX3TT40zUHGcCKrlOZRKC7u.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/dBXFLmgJHhkiIHVpijOheM3FMqa.jpg",
      "publicId": null
    },
    "youtubeId": "yRUAzGQ3nSY",
    "synopsis": "When 11-year-old Riley is uprooted from her Midwest life to San Francisco, her emotions Joy, Sadness, Fear, Anger and Disgust navigate the challenges of growing up from inside her mind's headquarters.",
    "cast": [
      "Amy Poehler",
      "Phyllis Smith",
      "Bill Hader",
      "Lewis Black"
    ],
    "director": "Pete Docter",
    "smartLabel": "Family Favourite"
  },
  {
    "title": "Zootopia",
    "year": 2016,
    "rating": 8,
    "duration": "1h 48m",
    "genres": [
      "Animation",
      "Adventure",
      "Comedy",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/sM33SANp9z6rXW8Itn7NnG1GOEs.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/5qAqCMxO7nDSOw3jYBBpZE0DTHJ.jpg",
      "publicId": null
    },
    "youtubeId": "jWM0ct-OLsM",
    "synopsis": "Rookie bunny police officer Judy Hopps proves herself by partnering with a wily fox to unravel a conspiracy in the mammal metropolis of Zootopia, learning that in a world full of bias, anyone can be anything.",
    "cast": [
      "Ginnifer Goodwin",
      "Jason Bateman",
      "Idris Elba",
      "J.K. Simmons"
    ],
    "director": "Byron Howard",
    "smartLabel": "Family Favourite"
  },
  {
    "title": "Big Hero 6",
    "year": 2014,
    "rating": 7.8,
    "duration": "1h 42m",
    "genres": [
      "Animation",
      "Action",
      "Adventure",
      "Comedy",
      "Family"
    ],
    "poster": {
      "url": "https://image.tmdb.org/t/p/w500/a4BfxRK8dBgbQqbRxPs8kmLd8LG.jpg",
      "publicId": null
    },
    "backdrop": {
      "url": "https://image.tmdb.org/t/p/w1280/9nmFQUzFoI5jaMPAFRhGvDRUWMl.jpg",
      "publicId": null
    },
    "youtubeId": "8IdMPpKMdcc",
    "synopsis": "Hiro Hamada, a young robotics prodigy in the futuristic city of San Fransokyo, forms an unlikely superhero team with his inflatable robot companion Baymax to investigate a sinister conspiracy.",
    "cast": [
      "Ryan Potter",
      "Scott Adsit",
      "Jamie Chung",
      "Genesis Rodriguez"
    ],
    "director": "Don Hall",
    "smartLabel": "Family Favourite"
  }
];

export async function seedMoviesProduction({ shouldConnect = true } = {}) {
  try {
    if (shouldConnect) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/StreamFlix';
      await mongoose.connect(mongoUri);
    }
    
    console.log('Seeding/updating movie database catalog...');
    
    let upsertCount = 0;
    for (const movie of movieCatalog) {
      await Movie.findOneAndUpdate(
        { title: movie.title, year: movie.year },
        { $set: movie },
        { upsert: true, new: true }
      );
      upsertCount++;
    }
    
    console.log(`Successfully processed/upserted ${upsertCount} movies.`);
    
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

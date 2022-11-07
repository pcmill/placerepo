## PlaceRepo

PlaceRepo is intended to be a geo dataset that can be used to create an search engine. 

It includes the following entities:
- Continents
- Countries
- Places (populated places, cities, towns etc.)
- Neighbourhoods
- Postal codes
- Admin levels 1 - 4
- Translations for all entities except postal codes, admin3 and admin4

The goal is to be either:
- A drop-in database model and dataset, currently targeted at Postgres.
- A downloadable set of CSV's to be ingested in software like Meilisearch or equivalent.

### Why not Geonames?

Geonames is awesome! But it takes quite some work for the data to be inserted in a relational database. After this it is also harder to keep your data synced up with the updates that are happening in Geonames. It also does not include translations of continents, countries and neighbourhoods.

PlaceRepo also does not contain all the entities that Geonames does support such as mountain ranges, ports, rivers and all the other types of geo data. I think that focussing will help the quality of the dataset at least in the beginning.

### ID structure

PlaceRepo uses the following structure for the ID's of every entity:
- 20 lowercase letters (syllables removed) and 10 numbers, 30 in total.
- Depending on the entity between the ID is 2 and 12 characters long.
- A prefix on every entity of 3 letters seperated by a dash to make it URL safe.

Examples:
- continent: `con-sh`
- country: `cou-3d0j`
- admin1 `ad1-cwq3p9`
- place: `pla-xhy2s8qw`
- neighbourhood: `nei-60drlgkbrjyz`

The prefix is included in every record in the database, to save space it is in a seperate table.

If you don't want to use the prefixes it should be safe to go without since on insert every ID is checked to be unique within its table.

### What are the polygons for?

The polygons are an optional visual reference. It should be mostly to get a general idea of how large a place is. Currently it is not yet meant to be an "official" outline of the entity since this is prone to change and takes a long time to research properly.
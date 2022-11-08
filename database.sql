CREATE TABLE "continent" (
  "id" varchar(2) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp
);

CREATE TABLE "continent_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(7) NOT NULL,
  "continent_id" varchar(2) NOT NULL
);

CREATE TABLE "country" (
  "id" varchar(4) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "country_code" varchar(2) NOT NULL,
  "continent_id" varchar(2) NOT NULL
);

CREATE TABLE "country_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(7) NOT NULL,
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "admin1" (
  "id" varchar(6) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "polygon" text,
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "admin1_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(7) NOT NULL,
  "admin1_id" varchar(6) NOT NULL
);

CREATE TABLE "admin2" (
  "id" varchar(6) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "polygon" text,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "admin2_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(7) NOT NULL,
  "admin2_id" varchar(6) NOT NULL
);

CREATE TABLE "admin3" (
  "id" varchar(6) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "polygon" text,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "admin3_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(7) NOT NULL,
  "admin3_id" varchar(6) NOT NULL
);

CREATE TABLE "admin4" (
  "id" varchar(6) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "polygon" text,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "admin4_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(7) NOT NULL,
  "admin4_id" varchar(6) NOT NULL
);

CREATE TABLE "place" (
  "id" varchar(8) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "population" integer,
  "elevation_meters" integer NOT NULL,
  "polygon" text,
  "wikipedia_id" varchar(20),
  "timezone" varchar(40),
  "admin1" varchar(6) NOT NULL,
  "admin2" varchar(6) NOT NULL,
  "admin3" varchar(6),
  "admin4" varchar(6),
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "place_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(7) NOT NULL,
  "place_id" varchar(8) NOT NULL
);

CREATE TABLE "neighbourhood" (
  "id" varchar(10) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "polygon" text,
  "place_id" varchar(8) NOT NULL
);

CREATE TABLE "neighbourhood_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "population" integer,
  "language_code" varchar(7) NOT NULL,
  "neighbourhood_id" varchar(10) NOT NULL
);

CREATE TABLE "postal_code" (
  "id" varchar(10) UNIQUE PRIMARY KEY,
  "code" varchar(20) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "polygon" text,
  "country_id" varchar(4) NOT NULL
);

ALTER TABLE "country" ADD FOREIGN KEY ("continent_id") REFERENCES "continent" ("id");
ALTER TABLE "place" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");
ALTER TABLE "postal_code" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");
ALTER TABLE "admin1" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");
ALTER TABLE "admin2" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");
ALTER TABLE "admin3" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");
ALTER TABLE "admin4" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");
ALTER TABLE "admin1_translation" ADD FOREIGN KEY ("admin1_id") REFERENCES "admin1" ("id");
ALTER TABLE "admin2_translation" ADD FOREIGN KEY ("admin2_id") REFERENCES "admin2" ("id");
ALTER TABLE "neighbourhood" ADD FOREIGN KEY ("place_id") REFERENCES "place" ("id");
ALTER TABLE "place_translation" ADD FOREIGN KEY ("place_id") REFERENCES "place" ("id");
ALTER TABLE "country_translation" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");
ALTER TABLE "continent_translation" ADD FOREIGN KEY ("continent_id") REFERENCES "continent" ("id");
ALTER TABLE "neighbourhood_translation" ADD FOREIGN KEY ("neighbourhood_id") REFERENCES "neighbourhood" ("id");
ALTER TABLE "continent" ADD FOREIGN KEY ("default_translation") REFERENCES "continent_translation" ("id");
ALTER TABLE "country" ADD FOREIGN KEY ("default_translation") REFERENCES "country_translation" ("id");
ALTER TABLE "admin1" ADD FOREIGN KEY ("default_translation") REFERENCES "admin1_translation" ("id");
ALTER TABLE "admin2" ADD FOREIGN KEY ("default_translation") REFERENCES "admin2_translation" ("id");
ALTER TABLE "admin3_translation" ADD FOREIGN KEY ("admin3_id") REFERENCES "admin3" ("id");
ALTER TABLE "admin3" ADD FOREIGN KEY ("default_translation") REFERENCES "admin3_translation" ("id");
ALTER TABLE "admin4" ADD FOREIGN KEY ("default_translation") REFERENCES "admin4_translation" ("id");
ALTER TABLE "admin4_translation" ADD FOREIGN KEY ("admin4_id") REFERENCES "admin4" ("id");
ALTER TABLE "place" ADD FOREIGN KEY ("default_translation") REFERENCES "place_translation" ("id");
ALTER TABLE "neighbourhood" ADD FOREIGN KEY ("default_translation") REFERENCES "neighbourhood_translation" ("id");

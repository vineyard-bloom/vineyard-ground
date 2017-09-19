CREATE TABLE creatures (
  "id" UUID NOT NULL,
  "name" CHARACTER VARYING(255) DEFAULT '' NOT NULL,
  "health" INTEGER DEFAULT 0 NOT NULL,
  "world" UUID NOT NULL,
  "created" TIMESTAMPTZ NOT NULL,
  "modified" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "creatures_pkey" PRIMARY KEY ("id")
);

CREATE SEQUENCE tags_id_seq;
CREATE TABLE tags (
  "id" INTEGER DEFAULT nextval('tags_id_seq') NOT NULL,
  "name" CHARACTER VARYING(255) DEFAULT '' NOT NULL,
  "created" TIMESTAMPTZ NOT NULL,
  "modified" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);
ALTER SEQUENCE tags_id_seq OWNED BY tags."id";

CREATE TABLE worlds (
  "id" UUID NOT NULL,
  "created" TIMESTAMPTZ NOT NULL,
  "modified" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "worlds_pkey" PRIMARY KEY ("id")
);

CREATE TABLE creatures_tags (
  "creature" UUID NOT NULL,
  "tag" INTEGER NOT NULL,
  "created" TIMESTAMPTZ NOT NULL,
  "modified" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "creatures_tags_pkey" PRIMARY KEY ("creature", "tag")
);

ALTER TABLE creatures
  CONSTRAINT "creatures_world_fkey" FOREIGN KEY (world) REFERENCES worlds(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

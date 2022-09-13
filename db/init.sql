CREATE TABLE image_upload (
    id SERIAL PRIMARY KEY,
    img_path character varying(255) NOT NULL,
    img_type character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    size character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


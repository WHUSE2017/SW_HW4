DROP TABLE IF EXISTS config;
CREATE TABLE config (
    key varchar(100),
    value nvarchar(100)
);
DROP TABLE IF EXISTS category;
CREATE TABLE category (
    value nvarchar(20)
);
DROP TABLE IF EXISTS tag;
CREATE TABLE tag (
    value nvarchar(20)
);
DROP TABLE IF EXISTS post;
CREATE TABLE post (
    id integer PRIMARY KEY autoincrement,
    time int(10),
    title nvarchar(50),
    category nvarchar(20),
    tag nvarchar(100),
    image nvarchar(100),
    text ntext
);
DROP TABLE IF EXISTS comment;
CREATE TABLE comment (
    uid integer PRIMARY KEY autoincrement,
    id int(10),
    time int(10),
    name nvarchar(30),
    email nvarchar(30),
    text ntext
);


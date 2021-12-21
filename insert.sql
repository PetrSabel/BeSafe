drop database if exists BeSafeDB;
create database BeSafeDB;
use BeSafeDB;


drop table if exists account;
CREATE TABLE account(
	IDAcc int primary key auto_increment,
	account_single boolean not null);

drop table if exists user;
CREATE TABLE user(
	IDUser int primary key auto_increment,
	faceID mediumblob,
	username varchar(20) not null unique,
	nome varchar(20) not null,
	risposta_S varchar(100) not null,
	cognome varchar(20) not null,
	telefono varchar(15) not null,
	domanda_S varchar(100) not null,
	email varchar(50) not null,
	password varchar(20) not null,
	impronta mediumblob,
    IDAcc int not null,
    capo_famiglia boolean not null,
    foreign key(IDAcc) references account(IDAcc));
    
drop table if exists notifica;
CREATE TABLE notifica(
	IDNot int primary key auto_increment,
	confermata boolean not null,
	datanot datetime not null,
	testo tinytext not null,
    IDAcc int not null,
    foreign key(IDAcc) references account(IDAcc));

drop table if exists dispositivo;
CREATE TABLE dispositivo(
	IDDis int primary key auto_increment,
	angolazione smallint not null,
	notturno boolean not null,
    IDAcc int not null,
    foreign key(IDAcc) references account(IDAcc));
    
drop table if exists datiregistrazioni;
CREATE TABLE datiregistrazioni(
	IDReg int primary key auto_increment,
    drive boolean not null,
    memoria_interna boolean not null,
    path varchar(100),
    IDAcc int not null,
    foreign key(IDAcc) references account(IDAcc));
    
drop table if exists impostazioni;
CREATE TABLE impostazioni(
	IDImp int primary key auto_increment,
    animali boolean not null,
    ore_inizio time,
    ore_fine time,
    notte boolean not null,
    salvare_quanto time not null,
    gps boolean not null,
    casa mediumblob,
    IDAcc int not null,
    foreign key(IDAcc) references account(IDAcc));
    
drop table if exists contatti;
CREATE TABLE contatti(
	contatto varchar(15) not null,
    idimp int,
    primary key (contatto, idimp),
    foreign key (idimp) references impostazioni(idimp));


use BeSafeDB;
insert into account(account_single) values (false), (true);
insert into account(account_single) values (true);
insert into account(account_single) values (true);

insert into user(IDAcc, faceID, username, nome, capo_famiglia, risposta_S, cognome, telefono, domanda_S, email, password, impronta)
values (1, null, "simus", "Simone", true, "gatto", "Dao", "3338379263", "qual è stato il tuo primo animale domestico?", "simone.dao@gmail.com", "bortobarzotto", null), 
(1, null, "fili", "Filippo", true, "cane", "Grilli", 3328371257, "qual è stato il tuo primo animale domestico?", "filippo.grilli@gmail.com", "cadodalpero", null),
(1, null, "pet", "Petr", true, "Katy Perry", "Sabel", 3937837401, "qual è il nome del tuo cantante preferito?", "petr.sabel@gmail.com", "ritornoalpassato3", null),
(2, null, "bonvy", "Francesco", true, "Mario", "Bonvecchio", 3328371257, "qual'è il nome di tuo padre?", "francescobonvecchio@gmail.com", "mArte23", null);

insert into notifica(IDAcc, confermata, datanot, testo) values
(1, false, "2004-05-23T14:25:10", "Allarme Attivato"),
(1, false, "2012-06-18T10:34:09", "Allarme Disattivato"),
(2, true, "2021-07-01T16:34:09", "Intrusione Avvertita");

insert into dispositivo(IDAcc, angolazione, notturno) values 
(1, 549, false),
(1, 258, true),
(1, 400, false),
(2, 123, false);

insert into datiregistrazioni(IDAcc, drive, memoria_interna, path) values
(1, true, false, "https://www.youtube.com/watch?v=7dilTLvbHxc&pp=ugMICgJpdBABGAE%3D"),
(1, true, false, "https://www.youtube.com/watch?v=KsGjkVpRqV4"),
(2, false, true, "https://www.youtube.com/watch?v=eAiXiy5kKVs");

insert into impostazioni(IDAcc, animali, ore_inizio, ore_fine, notte, salvare_quanto, GPS, casa) values
(1, false, "9:00", "17:00", true, "2:00", true, null),
(2, true, null, null, true, "2:00", true, null);

insert into contatti(IDImp, contatto) values
(1, "3248278903"),
(1, "3937465789"),
(2, "3333465794");

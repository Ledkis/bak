# bak

## Setup

### Mysql
```
sudo mysql -u root
CREATE DATABASE bak_development;
SELECT User, Host FROM mysql.user; 
CREATE User 'dev'@'localhost' IDENTIFIED BY 'dev';
GRANT ALL PRIVILEGES ON `bak_development` . * To 'dev'@'localhost' IDENTIFIED BY 'dev';
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'dev'@'localhost';
```
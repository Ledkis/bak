# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...


## setup
### MysSql
```
rails g migration CreateFiles title:string content:text
rake db:migrate
rake db:rollback
```
#### Mysql2::Error: Incorrect string value
https://stackoverflow.com/questions/22464011/mysql2error-incorrect-string-value
https://medium.com/@adamhooper/in-mysql-never-use-utf8-use-utf8mb4-11761243e434
```

ALTER DATABASE bak_development CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

rake db:drop
rake db:create
rake db:migrate
```

### ENV variables
#### using shell env variables
https://flaviocopes.com/shell-environment-variables/
in .bashrc and .zshrc, respectively.: export VARIABLE=something
#### using dotenv
https://github.com/bkeepers/dotenv
Add this line to the top of your application's Gemfile:
```gem 'dotenv-rails'```
```
echo DOCUMENTS_PATH=/home/emile/documents\\nDOCUMENTS_TYPES=articles,conference,m,note,sorbonne\\nDOCUMENTS_EXT=.md > .env  
```

## Help
http://notes.jerzygangi.com/how-to-obtain-the-number-of-files-in-a-folder-recursively-using-ruby/
https://stackoverflow.com/questions/12093770/ruby-removing-parts-a-file-path/12093941
https://stackoverflow.com/questions/20793180/get-file-name-and-extension-in-ruby
https://medium.com/@adamhooper/in-mysql-never-use-utf8-use-utf8mb4-11761243e434

class Files < ApplicationRecord
    validates :name, uniqueness: true
end
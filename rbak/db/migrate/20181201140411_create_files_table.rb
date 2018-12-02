class CreateFilesTable < ActiveRecord::Migration[5.2]
  def change
    create_table :files do |t|
      t.string :name
      t.string :path
      t.string :ext
      t.string :doc_type
      t.text :content, limit: 16777215
    end
  end
end

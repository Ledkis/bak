# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).

documents_path = ENV["DOCUMENTS_PATH"]
documents_types = ENV["DOCUMENTS_TYPES"]
documents_ext = ENV["DOCUMENTS_EXT"]

documents_types.split(",").each do |type|
  documents_type_path = File.join(documents_path, type)

  Dir.glob(File.join(documents_type_path, '**', '*')).each do |file_path|
    ext = File.extname(file_path)

    next unless ext == documents_ext

    name = File.basename(file_path, ".*")
    absolute_path = Pathname.new(file_path)
    project_root  = Pathname.new(documents_path)
    path = absolute_path.relative_path_from(project_root)
    content = File.open(file_path, "r:UTF-8").read.encode('UTF-8', invalid: :replace, undef: :replace, replace: '')

    Files.create name: name, path: path, ext: ext, doc_type: type, content: content
    
  end
end

require 'compass/import-once/activate'
# Require any additional compass plugins here.
add_import_path "src/vendor/foundation/6/scss"
additional_import_paths = ["src/vendor/black-tie/scss", "src/vendor/slick", "src/vendor/bootstraps"]


# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "src/css"
sass_dir = "src/sass"
images_dir = "images"
javascripts_dir = "src/js"

# You can select your preferred output style here (can be overridden via the command line):
output_style = :compact #:expanded or :nested or :compact or :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass src/sass scss && rm -rf sass && mv scss sass


# Attempted to use Autoprefixer with Ruby and Compass
# require 'autoprefixer-rails'
# 
# on_stylesheet_saved do |file|
  # css = File.read(file)
  # map = file + '.map'
# 
  # if File.exists? map
    # result = AutoprefixerRails.process(css,
      # from: file,
      # to:   file,
      # map:  { prev: File.read(map), inline: false })
    # File.open(file, 'w') { |io| io << result.css }
    # File.open(map,  'w') { |io| io << result.map }
  # else
    # File.open(file, 'w') { |io| io << AutoprefixerRails.process(css) }
  # end
# end
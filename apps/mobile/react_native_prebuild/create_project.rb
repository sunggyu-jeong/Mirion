require 'xcodeproj'

project_name = 'RNPrebuild'
project = Xcodeproj::Project.new("#{project_name}.xcodeproj")
project.new_target(:static_library, project_name, :ios, '15.1')
project.save

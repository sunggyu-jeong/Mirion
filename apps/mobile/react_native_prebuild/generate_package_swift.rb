framework_dir = File.join(__dir__, 'Frameworks')
frameworks = Dir.glob(File.join(framework_dir, '*.xcframework')).map { |p| File.basename(p, '.xcframework') }

target_entries = frameworks.map do |name|
  "    .binaryTarget(\n        name: \"#{name}\",\n        path: \"Frameworks/#{name}.xcframework\"\n    )"
end

product_names = frameworks.map { |n| "\"#{n}\"" }.join(', ')

lines = []
lines << '// swift-tools-version:5.9'
lines << 'import PackageDescription'
lines << ''
lines << 'let package = Package('
lines << '    name: "ReactNativePrebuild",'
lines << '    platforms: [.iOS(.v15)],'
lines << '    products: ['
lines << '        .library('
lines << '            name: "ReactNativePrebuild",'
lines << "            targets: [#{product_names}]"
lines << '        )'
lines << '    ],'
lines << '    targets: ['
lines << target_entries.join(",\n")
lines << '    ]'
lines << ')'

File.write(File.join(__dir__, 'Package.swift'), lines.join("\n") + "\n")
puts "Package.swift generated: #{frameworks.size} frameworks"

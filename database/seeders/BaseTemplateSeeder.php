<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BaseTemplate;

class BaseTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Use the provided sample design to create five base templates
        $editorContent = '{"counters":{"u_row":13,"u_column":16}}';
        $htmlContent = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Sample</title></head><body><div style="max-width:600px;margin:0 auto">Sample Fashion Template</div></body></html>';

        $templates = [
            ['name' => 'Fashion Landing', 'editor_content' => $editorContent, 'mail_content' => $htmlContent, 'thumbnail' => null],
            ['name' => 'Lookbook Showcase', 'editor_content' => $editorContent, 'mail_content' => $htmlContent, 'thumbnail' => null],
            ['name' => 'New Collection Drop', 'editor_content' => $editorContent, 'mail_content' => $htmlContent, 'thumbnail' => null],
            ['name' => 'Product Feature Spotlight', 'editor_content' => $editorContent, 'mail_content' => $htmlContent, 'thumbnail' => null],
            ['name' => 'Lifestyle Newsletter', 'editor_content' => $editorContent, 'mail_content' => $htmlContent, 'thumbnail' => null],
        ];

        foreach ($templates as $template) {
            BaseTemplate::create($template);
        }
    }
}

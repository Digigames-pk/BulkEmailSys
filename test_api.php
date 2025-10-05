<?php

/**
 * Simple test script to demonstrate the Email Template API
 *
 * This script shows how to:
 * 1. Get an authentication token
 * 2. Create an email template
 * 3. Get all email templates
 * 4. Update an email template
 * 5. Delete an email template
 */

$baseUrl = 'http://localhost:8000/api';

// Function to make API requests
function makeApiRequest($url, $method = 'GET', $data = null, $token = null)
{
    $ch = curl_init();

    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
    ];

    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status_code' => $httpCode,
        'body' => json_decode($response, true)
    ];
}

// Function to make multipart form data requests (for file uploads)
function makeMultipartRequest($url, $data, $token)
{
    $ch = curl_init();

    $headers = [
        'Accept: application/json',
        'Authorization: Bearer ' . $token,
    ];

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status_code' => $httpCode,
        'body' => json_decode($response, true)
    ];
}

echo "=== Email Template API Test Script ===\n\n";

// Step 1: Get authentication token (you need to implement this endpoint)
echo "1. Getting authentication token...\n";
echo "   Note: You need to implement a login endpoint to get a token\n";
echo "   For now, you can create a token manually using: php artisan tinker\n";
echo "   \$user = App\Models\User::first();\n";
echo "   \$token = \$user->createToken('test-token')->plainTextToken;\n";
echo "   echo \$token;\n\n";

// Example token (replace with actual token from tinker)
$token = 'your-token-here';

if ($token === 'your-token-here') {
    echo "   Please replace 'your-token-here' with an actual token from tinker\n";
    echo "   Then run this script again.\n";
    exit;
}

// Step 2: Get all email templates
echo "2. Getting all email templates...\n";
$response = makeApiRequest($baseUrl . '/email-templates', 'GET', null, $token);
echo "   Status: " . $response['status_code'] . "\n";
echo "   Response: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n\n";

// Step 3: Create a new email template
echo "3. Creating a new email template...\n";
$templateData = [
    'name' => 'Test Template via API',
    'email_subject' => 'Test Subject',
    'editor_content' => '{"design": {"body": {"rows": []}}}',
    'mail_content' => '<html><body><h1>Test Email</h1></body></html>'
];

$response = makeApiRequest($baseUrl . '/email-templates', 'POST', $templateData, $token);
echo "   Status: " . $response['status_code'] . "\n";
echo "   Response: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n\n";

if ($response['status_code'] === 201 && isset($response['body']['data']['id'])) {
    $templateId = $response['body']['data']['id'];

    // Step 4: Get the specific template
    echo "4. Getting template ID: $templateId...\n";
    $response = makeApiRequest($baseUrl . '/email-templates/' . $templateId, 'GET', null, $token);
    echo "   Status: " . $response['status_code'] . "\n";
    echo "   Response: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n\n";

    // Step 5: Update the template
    echo "5. Updating template ID: $templateId...\n";
    $updateData = [
        'name' => 'Updated Test Template via API',
        'email_subject' => 'Updated Test Subject',
        'editor_content' => '{"design": {"body": {"rows": []}}}',
        'mail_content' => '<html><body><h1>Updated Test Email</h1></body></html>'
    ];

    $response = makeApiRequest($baseUrl . '/email-templates/' . $templateId, 'PUT', $updateData, $token);
    echo "   Status: " . $response['status_code'] . "\n";
    echo "   Response: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n\n";

    // Step 6: Delete the template
    echo "6. Deleting template ID: $templateId...\n";
    $response = makeApiRequest($baseUrl . '/email-templates/' . $templateId, 'DELETE', null, $token);
    echo "   Status: " . $response['status_code'] . "\n";
    echo "   Response: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n\n";
}

echo "=== Test Complete ===\n";
echo "To test file uploads, you can use tools like Postman or curl with multipart/form-data\n";
echo "Example curl command for file upload:\n";
echo "curl -X POST http://localhost:8000/api/email-templates \\\n";
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\\n";
echo "  -H \"Accept: application/json\" \\\n";
echo "  -F \"name=Test Template\" \\\n";
echo "  -F \"email_subject=Test Subject\" \\\n";
echo "  -F \"csv_file=@/path/to/your/file.csv\" \\\n";
echo "  -F \"thumbnail=@/path/to/your/image.jpg\"\n";

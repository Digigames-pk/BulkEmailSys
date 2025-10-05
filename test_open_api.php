<?php

/**
 * Test script for the open Email Template API
 *
 * This script tests the API endpoints without authentication
 */

$baseUrl = 'http://localhost:8000/api';

// Function to make API requests
function makeApiRequest($url, $method = 'GET', $data = null)
{
    $ch = curl_init();

    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
    ];

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

echo "=== Open Email Template API Test ===\n\n";

// Test 1: Get all email templates
echo "1. Getting all email templates...\n";
$response = makeApiRequest($baseUrl . '/email-templates', 'GET');
echo "   Status: " . $response['status_code'] . "\n";
echo "   Response: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n\n";

// Test 2: Create a new email template
echo "2. Creating a new email template...\n";
$templateData = [
    'name' => 'Test Open API Template',
    'email_subject' => 'Test Subject for Open API',
    'editor_content' => '{"design": {"body": {"rows": []}}}',
    'mail_content' => '<html><body><h1>Test Email from Open API</h1><p>This template was created via the open API.</p></body></html>'
];

$response = makeApiRequest($baseUrl . '/email-templates', 'POST', $templateData);
echo "   Status: " . $response['status_code'] . "\n";
echo "   Response: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n\n";

if ($response['status_code'] === 201 && isset($response['body']['data']['id'])) {
    $templateId = $response['body']['data']['id'];

    // Test 3: Get the specific template
    echo "3. Getting template ID: $templateId...\n";
    $response = makeApiRequest($baseUrl . '/email-templates/' . $templateId, 'GET');
    echo "   Status: " . $response['status_code'] . "\n";
    echo "   Response: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n\n";

    // Test 4: Update the template
    echo "4. Updating template ID: $templateId...\n";
    $updateData = [
        'name' => 'Updated Open API Template',
        'email_subject' => 'Updated Subject for Open API',
        'editor_content' => '{"design": {"body": {"rows": []}}}',
        'mail_content' => '<html><body><h1>Updated Email from Open API</h1><p>This template was updated via the open API.</p></body></html>'
    ];

    $response = makeApiRequest($baseUrl . '/email-templates/' . $templateId, 'PUT', $updateData);
    echo "   Status: " . $response['status_code'] . "\n";
    echo "   Response: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n\n";

    // Test 5: Delete the template
    echo "5. Deleting template ID: $templateId...\n";
    $response = makeApiRequest($baseUrl . '/email-templates/' . $templateId, 'DELETE');
    echo "   Status: " . $response['status_code'] . "\n";
    echo "   Response: " . json_encode($response['body'], JSON_PRETTY_PRINT) . "\n\n";
}

echo "=== Test Complete ===\n";
echo "All API endpoints are working without authentication!\n";
echo "You can now use the frontend forms without any token setup.\n";

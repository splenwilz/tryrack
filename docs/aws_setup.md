# AWS S3 Setup Guide

## Required Information

To enable S3 file uploads in the backend, you need to provide the following:

### 1. AWS Credentials

Add these to your `.env` file in the backend directory:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1  # or your preferred region
AWS_S3_BUCKET_NAME=your-bucket-name
```

### 2. How to Get AWS Credentials

1. **Go to AWS Console**: https://console.aws.amazon.com
2. **Navigate to IAM**: Search for "IAM" in the search bar
3. **Create a User** (for programmatic access):
   - Click "Users" → "Add users"
   - Choose a username (e.g., `tryrack-backend`)
   - Check "Provide user access to the AWS Management Console or to the AWS CLI, programmatic access"
   - Click "Attach policies directly"
   - Search and select: **"AmazonS3FullAccess"** (or create a custom policy with only necessary permissions)
4. **Copy Credentials**:
   - After creating the user, you'll see an **Access key ID** and **Secret access key**
   - Save these securely - you won't be able to see the secret again
   - Add them to your `.env` file

### 3. S3 Bucket Configuration

#### Create the Bucket:
1. Go to S3 in AWS Console
2. Click "Create bucket"
3. Enter bucket name (must be globally unique)
4. Choose your region (match AWS_REGION in .env)
5. **Important**: Unblock public access if you want files to be publicly accessible

#### CORS Configuration:
Add this CORS configuration to your bucket:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

Steps:
1. Go to your bucket → "Permissions" tab
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Click "Edit"
4. Paste the JSON above
5. Save changes

### 4. Bucket Policy (Optional - for public access)

If you want files to be publicly accessible, add this bucket policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

## Implementation

The backend is now configured to:

1. **Upload files to S3**: When user uploads profile/full-body photos
2. **Return S3 URLs**: Store URLs in database, return them to frontend
3. **Handle file operations**: Upload, delete files from S3

## Files Created

- `backend/app/services/s3_service.py`: S3 upload/download/delete functions
- AWS configuration added to `backend/app/core/config.py`
- `boto3` dependency added to `backend/pyproject.toml`

## Next Steps

1. Add your AWS credentials to `.env` file
2. Install boto3: `cd backend && uv pip install boto3`
3. Restart your backend server
4. Test file upload from profile completion screen

## Security Best Practices

1. **Use IAM roles** (production): For EC2/ECS deployments
2. **Limit permissions**: Only grant S3 access, not all AWS services
3. **Use presigned URLs**: For direct client uploads
4. **Enable versioning**: In S3 bucket settings
5. **Set lifecycle policies**: Auto-delete old files


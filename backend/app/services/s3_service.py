"""
S3 Service for uploading files to AWS S3
Handles image uploads from profile completion
"""
import boto3
import base64
import logging
from botocore.exceptions import ClientError
from typing import Optional, BinaryIO
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)


def upload_file_to_s3(
    file_content: bytes,
    bucket_name: str,
    object_name: str,
    content_type: str = 'image/jpeg'
) -> Optional[str]:
    """
    Upload a file to S3 bucket
    
    :param file_content: Binary content of the file
    :param bucket_name: Name of the S3 bucket
    :param object_name: Object key (path) in S3
    :param content_type: MIME type of the file
    :return: URL of the uploaded file or None if failed
    """
    try:
        # Upload file to S3 (no ACL for modern buckets)
        s3_client.put_object(
            Bucket=bucket_name,
            Key=object_name,
            Body=file_content,
            ContentType=content_type
        )
        
        # Generate URL for the uploaded file
        url = f"https://{bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
        logger.info(f"File uploaded successfully: {url}")
        return url
        
    except ClientError as e:
        logger.error(f"Error uploading file to S3: {e}")
        return None


def upload_file_from_base64(
    base64_data: str,
    bucket_name: str,
    object_name: str,
    content_type: str = 'image/jpeg'
) -> Optional[str]:
    """
    Upload base64 encoded file to S3
    
    :param base64_data: Base64 encoded file data
    :param bucket_name: Name of the S3 bucket
    :param object_name: Object key (path) in S3
    :param content_type: MIME type of the file
    :return: URL of the uploaded file or None if failed
    """
    import time
    start_time = time.time()
    
    try:
        logger.info(f"🔵 S3 - Starting upload: {object_name}")
        
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        logger.info(f"🔵 S3 - Base64 data length: {len(base64_data)} chars")
        
        # Decode base64
        decode_start = time.time()
        file_content = base64.b64decode(base64_data)
        logger.info(f"🔵 S3 - Decode took: {(time.time() - decode_start)*1000:.0f}ms, size: {len(file_content)} bytes")
        
        # Upload to S3 (no ACL for modern buckets)
        upload_start = time.time()
        s3_client.put_object(
            Bucket=bucket_name,
            Key=object_name,
            Body=file_content,
            ContentType=content_type
        )
        logger.info(f"🔵 S3 - Upload took: {(time.time() - upload_start)*1000:.0f}ms")
        
        url = f"https://{bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
        total_time = (time.time() - start_time) * 1000
        logger.info(f"✅ S3 - Upload complete! Total: {total_time:.0f}ms, URL: {url}")
        return url
        
    except Exception as e:
        logger.error(f"❌ S3 - Error uploading file from base64 to S3: {e}")
        return None


def delete_file_from_s3(bucket_name: str, object_name: str) -> bool:
    """
    Delete a file from S3 bucket
    
    :param bucket_name: Name of the S3 bucket
    :param object_name: Object key (path) in S3
    :return: True if successful, False otherwise
    """
    try:
        s3_client.delete_object(Bucket=bucket_name, Key=object_name)
        logger.info(f"File deleted successfully from S3: {object_name}")
        return True
    except ClientError as e:
        logger.error(f"Error deleting file from S3: {e}")
        return False


def generate_presigned_url(
    bucket_name: str,
    object_name: str,
    expiration: int = 3600
) -> Optional[str]:
    """
    Generate a presigned URL for uploading a file directly from client
    
    :param bucket_name: Name of the S3 bucket
    :param object_name: Object key (path) in S3
    :param expiration: Time in seconds for the URL to remain valid
    :return: Presigned URL or None if failed
    """
    try:
        response = s3_client.generate_presigned_url(
            'put_object',
            Params={'Bucket': bucket_name, 'Key': object_name},
            ExpiresIn=expiration
        )
        return response
    except ClientError as e:
        logger.error(f"Error generating presigned URL: {e}")
        return None


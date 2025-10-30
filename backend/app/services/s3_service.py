"""
S3 Service for uploading files to AWS S3
Handles image uploads from profile completion
"""
import boto3
import base64
import logging
import binascii
import time
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
    start_time = time.time()
    
    try:
        print(f"📤 S3: Starting upload for {object_name}")
        logger.debug("Starting S3 upload", extra={"object": object_name})
        
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        # Decode base64
        decode_start = time.time()
        file_content = base64.b64decode(base64_data)
        decode_time = (time.time() - decode_start) * 1000
        file_size_mb = len(file_content) / 1024 / 1024
        print(f"📦 S3: Decoded {file_size_mb:.2f}MB in {decode_time:.0f}ms")
        logger.debug("Base64 decode complete", extra={"time_ms": decode_time, "size_bytes": len(file_content)})
        
        # Upload to S3 (no ACL for modern buckets)
        upload_start = time.time()
        print(f"☁️ S3: Uploading {file_size_mb:.2f}MB to S3...")
        s3_client.put_object(
            Bucket=bucket_name,
            Key=object_name,
            Body=file_content,
            ContentType=content_type
        )
        upload_time = (time.time() - upload_start) * 1000
        upload_speed = (file_size_mb / (upload_time / 1000)) if upload_time > 0 else 0
        print(f"✅ S3: Upload complete in {upload_time:.0f}ms ({upload_speed:.2f} MB/s)")
        logger.debug("S3 upload complete", extra={"time_ms": upload_time})
        
        url = f"https://{bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
        total_time = (time.time() - start_time) * 1000
        print(f"🎯 S3: Total S3 operation took {total_time:.0f}ms")
        logger.info("S3 upload successful", extra={"time_ms": total_time, "object": object_name})
        return url
        
    except (ClientError, ValueError, binascii.Error) as e:
        logger.exception("Error uploading file from base64 to S3", extra={"error": str(e)})
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


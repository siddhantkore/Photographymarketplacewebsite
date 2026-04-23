function getPrismaErrorResponse(err) {
  const prismaCode = err?.code;

  if (prismaCode === 'P2002') {
    return {
      status: 409,
      message: 'A record with this value already exists',
    };
  }

  if (prismaCode === 'P2003') {
    return {
      status: 409,
      message: 'This record cannot be deleted because it is still referenced by other data.',
    };
  }

  if (prismaCode === 'P2021') {
    return {
      status: 503,
      message: 'Database tables are not available right now. Please try again later.',
    };
  }

  if (prismaCode === 'P2025') {
    return {
      status: 404,
      message: 'Resource not found',
    };
  }

  if (prismaCode === 'P1000') {
    return {
      status: 503,
      message: 'Database authentication failed. Please try again later.',
    };
  }

  if (prismaCode === 'P1001' || prismaCode === 'P1002' || prismaCode === 'P1017') {
    return {
      status: 503,
      message: 'Database connection is temporarily unavailable. Please try again later.',
    };
  }

  if (prismaCode === 'P1003') {
    return {
      status: 503,
      message: 'Database is not ready yet. Please try again later.',
    };
  }

  return null;
}

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  const prismaError = getPrismaErrorResponse(err);
  if (prismaError) {
    return res.status(prismaError.status).json({
      success: false,
      message: prismaError.message,
    });
  }

  if (
    err?.name === 'PrismaClientInitializationError' ||
    err?.name === 'PrismaClientRustPanicError' ||
    err?.name === 'PrismaClientUnknownRequestError'
  ) {
    return res.status(503).json({
      success: false,
      message: 'Database service is temporarily unavailable. Please try again later.',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File size exceeds maximum limit of 50MB',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? 'Something went wrong. Please try again later.'
        : err.message || 'Request failed',
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};

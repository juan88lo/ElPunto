/**
 * Sistema de Logging de Errores
 * Registra errores del sistema en la base de datos para debugging y auditoría
 */

const ErrorLog = require('../models/ErrorLog');

/**
 * Registra un error en la base de datos
 * 
 * @param {Object} params - Parámetros del error
 * @param {string} params.code - Código identificador del error (ej: 'FACTURA_DUPLICADA')
 * @param {string} params.message - Mensaje descriptivo del error
 * @param {Object} params.context - Contexto adicional (usuarioId, cajaId, productos, etc.)
 * @param {string} params.severity - Nivel de severidad: 'info', 'warning', 'error', 'critical'
 * @param {string} params.stackTrace - Stack trace del error (opcional)
 * @returns {Promise<ErrorLog>} El registro de error creado
 */
async function logError({
  code,
  message,
  context = {},
  severity = 'error',
  stackTrace = null
}) {
  try {
    // Validar parámetros requeridos
    if (!code || !message) {
      console.error('⚠️ logError: code y message son requeridos');
      return null;
    }

    // Limpiar stack trace si es muy largo (mantener últimas 2000 caracteres)
    const cleanStackTrace = stackTrace ? stackTrace.slice(-2000) : null;

    // Crear registro de error
    const errorLog = await ErrorLog.create({
      errorCode: code,
      errorMessage: message,
      stackTrace: cleanStackTrace,
      context: context,
      severity: severity,
      resolved: false,
      timestamp: new Date()
    });

    // Log en consola para debugging inmediato
    const severityEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🔥'
    };

    console.log(
      `${severityEmoji[severity]} [${code}] ${message}`,
      context ? `\nContexto: ${JSON.stringify(context, null, 2)}` : ''
    );

    return errorLog;
  } catch (error) {
    // Si falla el logging, no detener la aplicación
    console.error('❌ Error al registrar error en ErrorLog:', error.message);
    console.error('Error original:', { code, message, context });
    return null;
  }
}

/**
 * Marca un error como resuelto
 * 
 * @param {number} errorId - ID del error a resolver
 * @param {number} userId - ID del usuario que resuelve el error
 * @param {string} notes - Notas sobre la resolución
 * @returns {Promise<ErrorLog>}
 */
async function resolveError(errorId, userId, notes = '') {
  try {
    const errorLog = await ErrorLog.findByPk(errorId);
    
    if (!errorLog) {
      throw new Error('Error log no encontrado');
    }

    await errorLog.update({
      resolved: true,
      resolvedBy: userId,
      resolvedAt: new Date(),
      notes: notes
    });

    console.log(`✅ Error #${errorId} marcado como resuelto por usuario #${userId}`);
    
    return errorLog;
  } catch (error) {
    console.error('❌ Error al resolver error log:', error.message);
    throw error;
  }
}

/**
 * Obtiene estadísticas de errores
 * 
 * @param {Date} startDate - Fecha de inicio (opcional)
 * @param {Date} endDate - Fecha de fin (opcional)
 * @returns {Promise<Object>} Estadísticas de errores
 */
async function getErrorStats(startDate = null, endDate = null) {
  try {
    const { Op, fn, col } = require('sequelize');
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Total de errores
    const totalErrors = await ErrorLog.count({ where: whereClause });

    // Errores por severidad
    const bySeverity = await ErrorLog.findAll({
      where: whereClause,
      attributes: [
        'severity',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['severity'],
      raw: true
    });

    // Errores no resueltos
    const unresolvedErrors = await ErrorLog.count({
      where: {
        ...whereClause,
        resolved: false
      }
    });

    // Errores más comunes
    const topErrors = await ErrorLog.findAll({
      where: whereClause,
      attributes: [
        'errorCode',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['errorCode'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    return {
      totalErrors,
      unresolvedErrors,
      bySeverity,
      topErrors
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error.message);
    return null;
  }
}

module.exports = {
  logError,
  resolveError,
  getErrorStats
};

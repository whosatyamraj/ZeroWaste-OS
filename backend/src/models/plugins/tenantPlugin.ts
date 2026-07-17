import { Schema } from 'mongoose';
import { tenantStorage } from '../../middleware/tenantContext';

export function tenantPlugin(schema: Schema) {
  // Automatically add tenantId to schema if it's missing (though it's best to define it explicitly)
  if (!schema.path('tenantId')) {
    schema.add({
      tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        index: true,
      },
    });
  }

  // Define the filter application logic
  const applyTenantFilter = function (this: any, next: () => void) {
    const context = tenantStorage.getStore();
    
    // Only apply the filter if we are inside a tenant context
    // This allows public routes or administrative scripts to bypass the filter
    if (context && context.tenantId) {
      // For mongoose Queries, 'this' refers to the Query object
      // $eq is used to prevent accidental NoSQL injections if context.tenantId is an object
      this.where({ tenantId: { $eq: context.tenantId } });
    }
    
    next();
  };

  // Intercept all read/update/delete operations
  schema.pre('find', applyTenantFilter);
  schema.pre('findOne', applyTenantFilter);
  schema.pre('findOneAndUpdate', applyTenantFilter);
  schema.pre('updateMany', applyTenantFilter);
  schema.pre('deleteOne', applyTenantFilter);
  schema.pre('deleteMany', applyTenantFilter);
  schema.pre('countDocuments', applyTenantFilter);
  schema.pre('aggregate', function (this: any, next: () => void) {
    const context = tenantStorage.getStore();
    if (context && context.tenantId) {
      const pipeline = this.pipeline();
      const matchStage = { $match: { tenantId: context.tenantId } };
      
      // $search and $geoNear MUST be the first stage in an aggregation pipeline.
      if (pipeline.length > 0 && (pipeline[0].$search || pipeline[0].$geoNear)) {
        // Insert after the first stage
        pipeline.splice(1, 0, matchStage);
      } else {
        // Safe to put at the very beginning
        pipeline.unshift(matchStage);
      }
    }
    next();
  });
}

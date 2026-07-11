using Microsoft.EntityFrameworkCore;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Sector> Sectors { get; }
    DbSet<Product> Products { get; }
    DbSet<WarehouseTask> WarehouseTasks { get; }
    DbSet<Comment> Comments { get; }
    DbSet<Message> Messages { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<InboundOrder> InboundOrders { get; }
    DbSet<InboundOrderItem> InboundOrderItems { get; }
    DbSet<TaskAssignment> TaskAssignments {get;}

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
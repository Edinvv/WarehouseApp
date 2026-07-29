using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<AppUser>, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Sector> Sectors => Set<Sector>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<WarehouseTask> WarehouseTasks => Set<WarehouseTask>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Message> Messages => Set<Message>();
   public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<Notification> Notifications => Set<Notification>();
public DbSet<InboundOrder> InboundOrders => Set<InboundOrder>();
public DbSet<InboundOrderItem> InboundOrderItems => Set<InboundOrderItem>();
public DbSet<TaskAssignment> TaskAssignments => Set<TaskAssignment>();
public DbSet<OutboundOrder> OutboundOrders => Set<OutboundOrder>();
public DbSet<OutboundOrderItem> OutboundOrderItems => Set<OutboundOrderItem>();
public DbSet<Stock> Stock => Set<Stock>();
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
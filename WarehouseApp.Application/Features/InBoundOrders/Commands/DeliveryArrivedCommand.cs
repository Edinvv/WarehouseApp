using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Domain.Entities;
using WarehouseApp.Domain.Enums;
using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;
using WarehouseApp.Application.Common.Interfaces;

using MediatR;


namespace WarehouseApp.Application.Features.InBoundOrders.Commands;

public record DeliveryArrivedCommand(Guid OrderId, string? CallerUserId = null) : IRequest<bool>;
    public class DeliveryArrivedCommandHandler : IRequestHandler<DeliveryArrivedCommand,bool>{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notificationservice;
        public DeliveryArrivedCommandHandler(IAppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationservice=notificationService;
        }
        public async Task<bool> Handle (DeliveryArrivedCommand request, CancellationToken cancellationToken)
    {
        var order= await _context.InboundOrders.Include(o=>o.Items).FirstOrDefaultAsync(o=>o.Id == request.OrderId);
        if (order is null)
        {
            return false;
        }
        order.Status = InboundOrderStatus.Unloading;
        var createdTasks = new List<object>();
        foreach (var item in order.Items)
        {
          var exists= await  _context.Products.AnyAsync(p=>p.Barcode == item.Barcode && p.SectorId == item.SectorId, cancellationToken);
            if (!exists)
            {
                var product = new Product
                {
                    Id = Guid.NewGuid(),
                    Name=item.ProductName,
                    Quantity=item.Quantity,
                    Barcode=item.Barcode,
                    MinimumQuantity=item.MinimumQuantity,
                    SectorId=item.SectorId
                };
                _context.Products.Add(product);
            }
            else
            {
               var product =  await _context.Products.FirstOrDefaultAsync(p => p.Barcode == item.Barcode && p.SectorId == item.SectorId, cancellationToken);
                product!.Quantity += item.Quantity;
            }
             
        }
        var grouped = order.Items.GroupBy(item => item.SectorId);   
        foreach (var group in grouped)
        {
            var sector = await _context.Sectors.FirstOrDefaultAsync(s => s.Id == group.Key, cancellationToken);
            if(sector is null) continue;
           
       var newTask = new WarehouseTask
{
    Id = Guid.NewGuid(),
    Title = $"Unload delivery to {sector.Name}",
    Status = TaskStatus.Todo,
    CreatedById = request.CallerUserId,
    InboundOrderId = order.Id,
    SectorId = group.Key,
    CreatedAt = DateTime.UtcNow
};
_context.WarehouseTasks.Add(newTask);
createdTasks.Add(new { id = newTask.Id, title = newTask.Title });
 foreach (var item in group)  // ← inside here
    {
        _context.TaskItems.Add(new TaskItem
        {
            Id= Guid.NewGuid(),
            ProductName=item.ProductName,
            Quantity=item.Quantity,
            Barcode=item.Barcode,
            IsCompleted=false,
            WarehouseTaskId=newTask.Id
        });
    }
        }
        await _context.SaveChangesAsync(cancellationToken);
        var metadata = JsonSerializer.Serialize(new { tasks = createdTasks });
        await _notificationservice.SendToRoleAsync("Supervisor", "Delivery arrived ” assign workers to restock tasks", "DeliveryArrived", metadata);
        return true;
    }

    }
    
        
    



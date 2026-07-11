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
            var taskId = Guid.NewGuid();
            var taskTitle = $"Restock {item.ProductName} to shelf";
            _context.WarehouseTasks.Add(new WarehouseTask
            {
                Id = taskId,
                Title = taskTitle,
                Status = TaskStatus.Todo,
                CreatedById = request.CallerUserId,
                InboundOrderId = order.Id,
                SectorId = item.SectorId,
                CreatedAt = DateTime.UtcNow
            });
            createdTasks.Add(new { id = taskId, title = taskTitle });
        }
        await _context.SaveChangesAsync(cancellationToken);
        var metadata = JsonSerializer.Serialize(new { tasks = createdTasks });
        await _notificationservice.SendToRoleAsync("Supervisor", "Delivery arrived â€” assign workers to restock tasks", "DeliveryArrived", metadata);
        return true;
    }

    }
    
        
    



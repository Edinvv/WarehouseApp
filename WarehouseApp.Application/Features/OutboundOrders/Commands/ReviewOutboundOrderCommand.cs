using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Entities;
using WarehouseApp.Domain.Enums;
using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;

namespace WarehouseApp.Application.Features.OutboundOrders.Commands;

public record ReviewOutboundOrderCommand(Guid OrderId, bool IsApproved, string? CallerUserId) : IRequest<bool>;

public class ReviewOutboundOrderCommandHandler : IRequestHandler<ReviewOutboundOrderCommand, bool>
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notification;
    public ReviewOutboundOrderCommandHandler(IAppDbContext context, INotificationService notification)
    {
        _context = context;
        _notification = notification;
    }

    public async Task<bool> Handle(ReviewOutboundOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.OutboundOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order is null) return false;

        if (!request.IsApproved)
        {
            order.Status = OutboundOrderStatus.Rejected;
            await _context.SaveChangesAsync(cancellationToken);
            await _notification.SendToRoleAsync("Supervisor", $"Outbound order for {order.RestaurantName} was rejected.", "OrderReviewed");
            return true;
        }

        order.Status = OutboundOrderStatus.Approved;

        var createdTasks = new List<object>();
        var grouped = order.Items.GroupBy(i => i.SectorId);

        foreach (var group in grouped)
        {
            var sector = await _context.Sectors.FirstOrDefaultAsync(s => s.Id == group.Key, cancellationToken);
            if (sector is null) continue;

            var task = new WarehouseTask
            {
                Id = Guid.NewGuid(),
                Title = $"Pick for {order.RestaurantName} from {sector.Name}",
                Status = TaskStatus.Todo,
                CreatedById = request.CallerUserId,
                OutboundOrderId = order.Id,
                SectorId = group.Key,
                CreatedAt = DateTime.UtcNow,
            };

            _context.WarehouseTasks.Add(task);
            createdTasks.Add(new { id = task.Id, title = task.Title });

            foreach (var item in group)
            {
                _context.TaskItems.Add(new TaskItem
                {
                    Id = Guid.NewGuid(),
                    ProductName = item.ProductName,
                    Quantity = item.Quantity,
                    Barcode = item.Barcode,
                    IsCompleted = false,
                    WarehouseTaskId = task.Id,
                });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        var tasksJson = System.Text.Json.JsonSerializer.Serialize(new { tasks = createdTasks });
        await _notification.SendToRoleAsync("Supervisor",
            $"Outbound order for {order.RestaurantName} approved — assign workers to pick tasks.",
            "DeliveryArrived",
            tasksJson);

        return true;
    }
}
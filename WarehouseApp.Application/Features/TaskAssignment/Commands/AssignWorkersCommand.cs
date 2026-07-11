using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.UserSecrets;
using Microsoft.IdentityModel.Tokens;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Application.Features.TaskAssignment.Commands;
public record AssignWorkersCommand(Guid TaskId,List<String> UserId): IRequest<bool>;
    public class AssignWorkersCommandHandler : IRequestHandler<AssignWorkersCommand,bool>
    {
        private readonly IAppDbContext _context;
        private readonly INotificationService _notification;
        public AssignWorkersCommandHandler(IAppDbContext context, INotificationService notification)
    {
        _context=context;
        _notification=notification;
    }
        public async Task<bool> Handle (AssignWorkersCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.WarehouseTasks.Include(t=>t.Sector).FirstOrDefaultAsync(t=>t.Id == request.TaskId);
        if(task is null)
        {
            return false;
        }
        var newAssignments = new List<string>();
        foreach (var user in request.UserId)
        {
            var exists = await _context.TaskAssignments.AnyAsync(t=>t.WarehouseTaskId == request.TaskId && t.UserId == user );
            if (!exists)
            {
                newAssignments.Add(user);
              _context.TaskAssignments.Add(new WarehouseApp.Domain.Entities.TaskAssignment
                {
                    Id=  Guid.NewGuid(),
                    WarehouseTaskId= request.TaskId,
                    UserId=user 
                });
            }
        }
        await _context.SaveChangesAsync();
        foreach (var userId in newAssignments)
{
    var metadata = System.Text.Json.JsonSerializer.Serialize(new
    {
        taskId = task.Id,
        sectorId = task.SectorId,
        sectorName = task.Sector.Name
    });
    await _notification.SendToUserAsync(userId, $"You have been assigned: {task.Title}", "TaskAssigned", metadata);
}

        
        return true;
    }
    }

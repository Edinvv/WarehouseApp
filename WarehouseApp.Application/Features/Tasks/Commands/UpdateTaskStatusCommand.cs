using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;

namespace WarehouseApp.Application.Features.Tasks.Commands;

public record UpdateTaskStatusCommand(Guid TaskId, TaskStatus NewStatus) : IRequest<bool>;

    public class UpdateTaskStatusCommandHandler : IRequestHandler<UpdateTaskStatusCommand, bool>
    {
        private readonly IAppDbContext _context;
        public UpdateTaskStatusCommandHandler(IAppDbContext context)
        {
            _context = context;
        }
        public async Task<bool> Handle(UpdateTaskStatusCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.WarehouseTasks.FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);
        if (task == null)
        {
           return false;
        }
        task.Status = request.NewStatus;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
    }

using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.UserSecrets;
using Microsoft.IdentityModel.Tokens;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Application.Features.TaskAssignment.Commands;

public record CompleteTaskItemCommand(Guid Id): IRequest<bool>;

    public class CompleteTaskItemCommandHandler : IRequestHandler<CompleteTaskItemCommand,bool >
    {
        private readonly IAppDbContext _context ;
        public CompleteTaskItemCommandHandler (IAppDbContext context)
    {
        _context=context;
    }
    public async Task<bool> Handle (CompleteTaskItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.TaskItems.FirstOrDefaultAsync(ti=>ti.Id== request.Id);
        if (item is null)
        {
            return false;
        }
        item.IsCompleted= true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
    }

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.API.Controllers;

public record CreateUserRequest(string FirstName, string LastName, string Email, string Password, string Role);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    public UsersController(UserManager<AppUser> userManager) => _userManager = userManager;

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = _userManager.Users.ToList();
        var result = new List<object>();
        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            result.Add(new { u.Id, u.FirstName, u.LastName, u.Email, Role = roles.FirstOrDefault() ?? "Worker" });
        }
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser(CreateUserRequest request)
    {
        var user = new AppUser
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            UserName = request.Email
        };
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(user, request.Role);
        return Ok(new { user.Id, user.FirstName, user.LastName, user.Email, request.Role });
    }
}
use anchor_lang::prelude::*;



declare_id!("FFPUW7xndZDqUnz6bL2QgnUPWX8sCQHMK5pPv5of3x7k");

#[program]
mod crud {
    use super::*;

    pub fn create_crud_entry(
        ctx: Context<CreateEntry>, 
        title: String, 
        message: String,
    ) -> Result<()> {
        msg!("Crud Entry Created");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let crud_entry = &mut ctx.accounts.crud_entry;
        crud_entry.owner = ctx.accounts.owner.key();
        crud_entry.title = title;
        crud_entry.message = message;
        Ok(())
    }

    pub fn update_crud_entry(
        ctx: Context<UpdateEntry>, 
        title: String, 
        message: String,
    ) -> Result<()> {
        msg!("Crud Entry Updated");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let crud_entry = &mut ctx.accounts.crud_entry;
        crud_entry.message = message;

        Ok(())
    }

    pub fn delete_crud_entry(_ctx: Context<DeleteEntry>, title: String) -> Result<()> {
        msg!("Crud entry titled {} deleted", title);
        Ok(())
    }   
}

#[account]
pub struct CrudEntryState {
    pub owner: Pubkey,
    pub title: String,
    pub message: String,
}

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct CreateEntry<'info> {
    #[account(
        init, 
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        payer = owner,
        space = 8 + 32 + 4 title.len() + 4 + message.len()
    )]
    pub crud_entry: Account<'info, CrudEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct UpdateEntry<'info> {
    #[account(
        mut, 
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump,
        realloc = 8 + 32 + 4 + title.len() + 4 + message.len(),
        realloc::payer = owner,
        realloc::zero = true,
    )]
    pub crud_entry: Account<'info, CrudEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account(
        mut, 
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        close= owner,
    )]
    pub journal_entry: Account<'info, CrudEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
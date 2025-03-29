import { Library } from "../framework/library";
import { Orchestrater } from "../framework/orchestrater";
import { CHOOSE_UI_BLOCK_ACTION } from "./actions";
import { GET_ASSET_PRICE_ORACLE, GET_ASSET_PRICES, PRESS_RELEASE_ORACLE_GENERAL, PRESS_RELEASE_ORACLE_SPECIFIC } from "./oracles";


const library = Library.define()

library
.AddAction(CHOOSE_UI_BLOCK_ACTION)
.AddOracle(PRESS_RELEASE_ORACLE_SPECIFIC)
.AddOracle(PRESS_RELEASE_ORACLE_GENERAL)
.AddOracle(GET_ASSET_PRICE_ORACLE)
.AddOracle(GET_ASSET_PRICES)

export const orchestrator = new Orchestrater(
    library,
    `I help humans gain understanding about securities trading on the Nairobi Stock Exchange (NSE) 
    by providing them with information about the assets they are curious about.
    I can get for them data from press releases, and I can also get them the price of a specific asset, or even all the assets in the NSE.
    After I have collected relevant information, I also choose the UI components to display the information to the user.
    If the user's request includes an action word like buy, I need to provide them with a UI block to complete this action as well as the a summary of any financial information regarding the asset.
    `
)



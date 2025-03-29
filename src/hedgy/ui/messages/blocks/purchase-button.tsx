"use client";

interface Props {
    assetName: string,
    quantity: number
}

export function PurchaseButton(props: Props){
    const { assetName, quantity } = props
    
    return (
        <div className="w-full bg-blue-500 border-rounded" >
            <p className="font-semibold text-white" >
                Cool Button by Chizaa
            </p>
        </div>
    )

}
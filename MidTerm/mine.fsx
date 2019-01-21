open System
#load "lwc.fsx"

open System.Drawing
open System.Windows.Forms

open Lwc

type Node() as this =
    let mutable location = PointF()
    let mutable size = SizeF(50.f, 50.f)
    let mutable letterSize = 15.f
    let mutable id = "*EDIT*"
    let font = new Font(FontFamily.GenericSansSerif, letterSize )
    let mutable selected = false
    let mutable transform = W2V()
    let color = Color.Black

    member this.Location with   get() = location
                                and set(l) = location <- l
    member this.Size with       get() = size   
                                and set(l) = size <- l
    member this.ID with         get() = id
                                and set(x) = id <- x
    member this.LetterSize with get() = letterSize
                                and set(s) = letterSize <- s
    member this.Selected with   get() = selected
                                and set(b) = selected <- b
    member this.Color with      get() = color
    member this.Font with       get() = font
    member this.Transform with  get() = transform
    member this.W2V with        get() = transform.W2V
    member this.V2W with        get() = transform.V2W

    member this.HitTest (p : PointF) = 
    //prende un punto in coordinate vista e verifica che sia all' interno del rettangolo che contiene il nodo
        let pW = TransformP this.V2W p 
        let r = RectangleF(this.Location, this.Size) in r.Contains(pW)

    member this.Paint (g : Graphics) =
        if this.Selected then 
            let pen = Pens.Red 
            let r = RectangleF(this.Location, this.Size) |> RectF2Rect
            g.DrawRectangle(pen, r)
        let h = int this.Size.Height
        let x = int this.Location.X
        let y = int this.Location.Y
        g.DrawEllipse(Pens.Blue, x, y, h, h)
        g.DrawString(this.ID, this.Font, Brushes.Black, PointF(this.Location.X, this.Location.Y))
                               

type Arc() as this =
    let mutable startNode = Node()
    let mutable endNode = Node()

    member this.StartNode with  get() = startNode
                                and set(n) = startNode <- n                           
    member this.EndNode with    get() = endNode
                                and set(n) = endNode <- n

    member this.Paint(g: Graphics) =
        //let mutable startp = startNode.Location |> TransformP startNode.Transform.W2V
        let startp = PointF(startNode.Location.X + startNode.Size.Width/ 2.f, startNode.Location.Y + startNode.Size.Height/ 2.f) |> TransformP startNode.Transform.W2V
        let endp = PointF(endNode.Location.X + endNode.Size.Width/ 2.f, endNode.Location.Y + endNode.Size.Height / 2.f) |> TransformP endNode.Transform.W2V
        g.DrawLine(Pens.Black, startp, endp)


type Container() as this =
    inherit LWContainer()

    let mutable nodes = ResizeArray<Node>()
    let mutable arcs = ResizeArray<Arc>()
    let mutable animation = ResizeArray<PointF*Node>()  //<Da dove parto, nodo da muovere>

    let mutable selNode : option<Node> = None 
    let mutable addingNodes = false
    let mutable addingArcs = false
    let mutable drag = false
    let mutable dragOffset = PointF()
    let mutable dragStart = PointF()
    let mutable nextNodePos = PointF()
    let timer = new Timer(Interval=1000/60)     

    let upButton = PIButton(Text = "Up", Position = PointF(44.f, 40.f), Size = SizeF(30.f,30.f), CoordinateType = View)
    let downButton = PIButton(Text = "Down", Position = PointF(44.f, 76.f), Size = SizeF(30.f,30.f), CoordinateType = View)
    let leftButton = PIButton(Text = "Left", Position = PointF(6.f, 76.f), Size = SizeF(30.f,30.f), CoordinateType = View)
    let rightButton = PIButton(Text = "Right", Position = PointF(84.f, 76.f), Size = SizeF(30.f,30.f), CoordinateType = View)
    let zoomInButton = PIButton(Text = "ZoomIn", Position = PointF(4.f, 112.f), Size = SizeF(30.f,30.f), CoordinateType = View)
    let zoomOutButton = PIButton(Text = "ZoomOut", Position = PointF(55.f, 112.f), Size = SizeF(30.f,30.f), CoordinateType = View)
    let rotateLeft = PIButton(Text = "RotSx", Position = PointF(4.f, 40.f), Size = SizeF(30.f,30.f), CoordinateType = View)
    let rotateRight = PIButton(Text = "RotDx", Position = PointF(80.f, 40.f), Size = SizeF(30.f,30.f), CoordinateType = View)
    let newNode = PIButton(Text = "Add Node", Position = PointF(4.f, 4.f), Size = SizeF(30.f, 30.f), CoordinateType = View)
    let newArc = PIButton(Text = "Add Arc", Position = PointF(64.f, 4.f), Size = SizeF(30.f, 30.f), CoordinateType = View)
    //let delButton = PIButton(Text = "Reset", Position = PointF(114.f, 4.f), Size = SizeF(30.f, 30.f), CoordinateType = View)
    let delButton = PIButton(Text = "DelSel", Position = PointF(114.f, 4.f), Size = SizeF(30.f, 30.f), CoordinateType = View)
    let resetButton = PIButton(Text = "Reset", Position = PointF(4.f, 150.f), Size = SizeF(30.f, 30.f), CoordinateType = View)

    let buttons = [|upButton; downButton; leftButton; rightButton; zoomInButton; zoomOutButton; rotateLeft; rotateRight; newNode; newArc; delButton; resetButton|]

    let handlerButtons (x : String) =
        match x with
            | "up" -> this.Transform.Translate(0.f, -10.f); upButton.BorderColor <- Color.Red
            | "down" -> this.Transform.Translate(0.f, 10.f); downButton.BorderColor <- Color.Red
            | "left" -> this.Transform.Translate(-10.f, 0.f); leftButton.BorderColor <- Color.Red
            | "right" -> this.Transform.Translate(10.f, 0.f); rightButton.BorderColor <- Color.Red
            | "rotateLeft" -> nodes |> Seq.iter(fun l -> l.Transform.RotateAt(-15.f, PointF(0.f, 0.f)))
                              rotateLeft.BorderColor <- Color.Red
            | "rotateRight" -> nodes |> Seq.iter(fun l -> l.Transform.RotateAt(15.f, PointF(0.f, 0.f)))
                               rotateRight.BorderColor <- Color.Red
            | "zoomIn" -> 
                nodes |> Seq.iter(fun l -> 
                    l.LetterSize <- (l.LetterSize * 1.1f ); 
                    zoomInButton.BorderColor <- Color.Red)
                this.Transform.Scale(1.1f, 1.1f)
            | "zoomOut" -> 
                nodes |> Seq.iter(fun l -> 
                    l.LetterSize <- (l.LetterSize / 1.1f ); 
                    zoomOutButton.BorderColor <- Color.Red)
                this.Transform.Scale(1.f/1.1f, 1.f/1.1f)        //trasforma la W2V
            | "delete" ->
                arcs.RemoveAll(fun l -> l.StartNode.Selected || l.EndNode.Selected) |> ignore;
                nodes.RemoveAll(fun l -> l.Selected) |> ignore
            | "deleteAll"   -> nodes.Clear(); arcs.Clear(); animation.Clear()
            | _ -> ()
  

    do 
        //Double Buffering
        this.SetStyle(ControlStyles.OptimizedDoubleBuffer, true)
        this.SetStyle(ControlStyles.AllPaintingInWmPaint ||| ControlStyles.OptimizedDoubleBuffer, true)

        timer.Start()

        // Aggiunta dei bottoni al container
        this.LWControls.AddRange([|upButton; downButton; leftButton; rightButton; zoomInButton; zoomOutButton; 
                                    rotateLeft; rotateRight; newNode; newArc; delButton; resetButton|])    
        this.LWControls |> Seq.iter(fun c -> c.Parent <- this )

        // Handlers bottoni
        upButton.MouseDown.Add(fun _ -> handlerButtons("up"); this.Invalidate())
        downButton.MouseDown.Add(fun _ -> handlerButtons("down"); this.Invalidate())
        leftButton.MouseDown.Add(fun _ -> handlerButtons("left"); this.Invalidate())
        rightButton.MouseDown.Add(fun _ -> handlerButtons("right"); this.Invalidate())
        rotateLeft.MouseDown.Add(fun _ -> handlerButtons("rotateLeft"); this.Invalidate())
        rotateRight.MouseDown.Add(fun _ -> handlerButtons("rotateRight"); this.Invalidate())
        zoomInButton.MouseDown.Add(fun _ -> handlerButtons("zoomIn"); this.Invalidate())
        zoomOutButton.MouseDown.Add(fun _ -> handlerButtons("zoomOut"); this.Invalidate())
        newNode.MouseDown.Add(fun _ -> addingNodes <- true; addingArcs <- false; newNode.BorderColor <- Color.Red; this.Invalidate())
        newArc.MouseDown.Add(fun _ -> addingArcs <- true; addingNodes <- false; newArc.BorderColor <- Color.Red; this.Invalidate())
        resetButton.MouseDown.Add(fun _ -> handlerButtons("deleteAll"); addingArcs <- false; addingNodes <- false; this.Invalidate())
        delButton.MouseDown.Add(fun _ -> handlerButtons("delete"); this.Invalidate())

        timer.Tick.Add(fun _ ->
            animation |> Seq.iter( fun (p,l) ->
                let mutable tmp = PointF(p.X - l.Location.X, p.Y - l.Location.Y)
                let mutable dt = 0.1f
                if sqrt(tmp.X*tmp.X+tmp.Y*tmp.Y) < 1.f then
                    l.Location <- p
                else
                    let sum = PointF(tmp.X*dt, tmp.Y*dt)
                    l.Location <- PointF(l.Location.X + sum.X, l.Location.Y + sum.Y)
                this.Invalidate()
                )
            animation.RemoveAll(fun (p,l) -> p = l.Location) |> ignore
            )

    override this.OnMouseDown e =
        base.OnMouseDown e
        // Verifico se ho clickato su un bottone
        let butt = buttons |> Seq.tryFind(fun b -> b.BorderColor.Equals(Color.Red))
        let mutable check = false
        match butt with
            | Some _ -> check <- false
            | None -> check <- true
        if check then       //non ho clickato su un bottone
            // Verifico se ho clickato su un nodo
            let n = nodes |> Seq.tryFind(fun l -> l.HitTest (e.Location |> Point2PointF |> TransformP this.Transform.V2W))
            if e.Button.Equals(MouseButtons.Right) then
                nodes |> Seq.iter (fun l -> l.Selected <- false)
                selNode <- None
                match n with
                    | None -> ()
                    | Some l -> l.Selected <- true; selNode <- n
                this.Invalidate()
            // Se ho clickato su un nodo..
            elif n.IsSome then
                match n with
                    |Some l ->  //drag n drop (left click)
                        if e.Button.Equals(MouseButtons.Left) then
                            dragStart <- l.Location
                            animation.RemoveAll(fun (p,l2) -> if l2=l then dragStart <- p; true else false) |> ignore
                            l.Selected <- true
                            selNode <- n
                            drag <- true
                            let mutable pV = e.Location |> Point2PointF |> TransformP this.Transform.V2W
                            pV <- pV |> TransformP l.Transform.V2W 
                            dragOffset <- PointF(pV.X - l.Location.X, pV.Y - l.Location.Y) 
                            this.Invalidate()
                        elif e.Button.Equals(MouseButtons.Right) then
                            selNode <- n
                            this.Invalidate()     

                    | _ -> ()
            // altrimenti ho clickato in un punto in cui posso aggiungere un nuovo nodo
            elif addingNodes then
                nextNodePos <- e.Location |> Point2PointF |> TransformP this.Transform.V2W
                //printfn "Position: %A" nextNodePos


    override this.OnMouseUp e =
        base.OnMouseUp e
        let mutable check = false
        // Verifico se ho rilasciato su un bottone
        let butt = buttons |> Seq.tryFind(fun b -> b.BorderColor.Equals(Color.Red))
        match butt with
            | Some b -> b.BorderColor <- Color.MidnightBlue; check <- false; this.Invalidate()
            | None -> check <- true
        if check then   //non sono su un bottone
            // Se stavo facendo drag n drop "mollo" il nodo
            if drag then
                match selNode with
                    |Some l -> 
                        drag <- false
                        l.Selected <- false      
                        if arcs.Exists(fun a -> a.EndNode = l || a.StartNode = l)  && not (animation.Exists(fun (p,l2) -> l = l2)) then
                            animation.Add(dragStart, l)
                        selNode <- None                 
                        this.Invalidate();
                    |None -> ()
            elif addingNodes then 
                let mutable noOne = false
                let n = nodes |> Seq.tryFind(fun l -> l.HitTest (e.Location |> Point2PointF |> TransformP this.Transform.V2W))
                match n with
                    | Some _ -> noOne <- false
                    | None -> noOne <- true
                if noOne then
                    nextNodePos <- e.Location |> Point2PointF |> TransformP this.Transform.V2W
                    nodes.Add(new Node(Location = nextNodePos))
                    //printfn "Counter: %d" nodes.Count
                    //printfn "Inserito qua: %A" nextNodePos
                    this.Invalidate()
            elif addingArcs then
                let mutable someone = false
                let n = nodes |> Seq.tryFind(fun l -> l.HitTest (e.Location |> Point2PointF |> TransformP this.Transform.V2W))
                match n with
                    | Some _ -> someone <- true
                    | None -> someone <- false
                if someone then 
                    //printfn("Selezionato - MsUP:addingArcs")
                    let tmp = selNode.Value
                    selNode <- n
                    let aux = selNode.Value
                    if tmp <> aux then              //mega bug
                        let newArc = new Arc(StartNode = tmp, EndNode = aux)
                        if (not (arcs.Exists(fun l -> 
                                                (l.StartNode = tmp || l.StartNode = aux) && (l.EndNode = tmp || l.EndNode = aux)
                                                    ))) then
                                        arcs.Add(newArc)
                                        this.Invalidate()
                                        //printfn "Numero archi aumentato a %d" arcs.Count


    override this.OnMouseMove e =
        base.OnMouseMove e
        if drag then
            // aggiorno i dati relativi alla posizione del nodo che sto draggando
            match selNode with
                |Some l ->
                    let mutable pV = e.Location |> Point2PointF |> TransformP this.Transform.V2W
                    pV <- pV |> TransformP l.Transform.V2W 
                    let newLoc = PointF(pV.X - dragOffset.X, pV.Y - dragOffset.Y)
                    l.Location <- newLoc
                    this.Invalidate();
                |None -> ()

    override this.OnKeyPress k =
        base.OnKeyPress k
        match k.KeyChar with
            | '\b' -> 
                match selNode with
                    |Some l -> if l.ID.Length > 0 then
                                    l.ID <- l.ID.Remove(l.ID.Length - 1); this.Invalidate()
                    |None -> ()
            | _ ->
                match selNode with
                    |Some l -> 
                        l.ID <- l.ID + string k.KeyChar; this.Invalidate()
                    |None -> ()

    override this.OnPaint e =
        let g = e.Graphics
        base.OnPaint e
        nodes |> Seq.iter (fun c ->
            let aux = this.Transform.W2V.Clone();
            aux.Multiply(c.W2V);
            g.Transform <- aux;
            c.Paint g
        )
        arcs |> Seq.iter (fun c ->
            let aux = this.Transform.W2V.Clone();
            g.Transform <- aux;
            c.Paint g
        )

let f = new Form(TopMost=true)
let c = new Container(Dock=DockStyle.Fill)
f.Controls.Add(c)
f.Show()

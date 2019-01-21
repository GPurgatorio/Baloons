open System.Windows.Forms
open System.Drawing

type W2V() =
  let w2v = new Drawing2D.Matrix()
  let v2w = new Drawing2D.Matrix()

  member this.Translate(tx, ty) =
    w2v.Translate(tx, ty)
    v2w.Translate(-tx, -ty, Drawing2D.MatrixOrder.Append)

  member this.Rotate(a) =
    w2v.Rotate(a)
    v2w.Rotate(-a, Drawing2D.MatrixOrder.Append)

  member this.Scale(sx, sy) =
    w2v.Scale(sx, sy)
    v2w.Scale(1.f/sx, 1.f/sy, Drawing2D.MatrixOrder.Append)

  member this.ScaleAtV(sx:single, sy: single, cv:PointF) =
      let cw = cv 
      this.Scale(sx, sy)
      let cwp = cv 
      this.Translate(cwp.X - cw.X, cwp.Y - cw.Y)

  member this.RotateAt (a, p) =
    w2v.RotateAt(a, p)
    v2w.RotateAt(-a, p, Drawing2D.MatrixOrder.Append)

  member this.W2V with get() = w2v
  member this.V2W with get() = v2w

let Rect2RectF (r:Rectangle) =
  RectangleF(single r.X, single r.Y, single r.Width, single r.Height)

let RectF2Rect (r:RectangleF) =
  Rectangle(int r.X, int r.Y, int r.Width, int r.Height)

let Point2PointF (p : Point) =
  PointF(single p.X, single p.Y)

let TransformP (m:Drawing2D.Matrix) (p:PointF) =
  let pts = [| p |]
  m.TransformPoints(pts)
  pts.[0]

type CoordinateType = View | World

type LWControl() =
  let mutable coordinates = View

  let mutable position = PointF()
  let mutable size = SizeF()

  let mutable parent : Control = null

  let mousedownevt = new Event<MouseEventArgs>()
  let mousemoveevt = new Event<MouseEventArgs>()
  let mouseupevt = new Event<MouseEventArgs>()

  member this.CoordinateType
    with get() = coordinates
    and set(v) = coordinates <- v
 
  member this.Position
    with get() = position
    and set(v) = position <- v

  member this.Size
    with get() = size
    and set(v) = size <- v
  
  member this.Parent 
    with get() = parent
    and set(v) = parent <- v

  member this.MouseDown = mousedownevt.Publish

  abstract OnMouseDown : MouseEventArgs -> unit
  default this.OnMouseDown e = mousedownevt.Trigger(e)

  abstract OnMouseMove : MouseEventArgs -> unit
  default this.OnMouseMove e = mousemoveevt.Trigger(e)

  abstract OnMouseUp : MouseEventArgs -> unit
  default this.OnMouseUp e = mouseupevt.Trigger(e)

  abstract OnPaint : PaintEventArgs -> unit
  default this.OnPaint e = ()


  abstract HitTest : PointF -> bool
  default this.HitTest p =
    (new RectangleF(position, size)).Contains(p)

type LWContainer() as this =
  inherit UserControl()

  let transformPoint (m:Drawing2D.Matrix) (p:PointF) =
    let pts = [| p |]
    m.TransformPoints(pts)
    pts.[0]

  let transform = W2V()

  let controls = ResizeArray<LWControl>()

  let scrollUp () =
    transform.Translate(0.f, 10.f)
    this.Invalidate()

  
  member this.LWControls with get() = controls

  member this.Transform with get() = transform

  override this.OnMouseDown e =
    let p = PointF(single e.X, single e.Y)
    let controlsView = controls |> Seq.filter (fun c -> c.CoordinateType = View)
    match (controlsView |> Seq.tryFind (fun c -> c.HitTest p)) with
    | Some c -> c.OnMouseDown(e)
    | None -> 
      let pw = transformPoint transform.V2W p
      let controlsWorld = controls |> Seq.filter (fun c -> c.CoordinateType = World)
      match (controlsWorld |> Seq.tryFind(fun c -> c.HitTest pw)) with
      | Some c -> c.OnMouseDown(e)
      | None -> ()

  override this.OnMouseMove e =
    let p = PointF(single e.X, single e.Y)
    let controlsView = controls |> Seq.filter (fun c -> c.CoordinateType = View)
    match (controlsView |> Seq.tryFind (fun c -> c.HitTest p)) with
    | Some c -> c.OnMouseMove(e)
    | None -> 
      let pw = transformPoint transform.V2W p
      let controlsWorld = controls |> Seq.filter (fun c -> c.CoordinateType = World)
      match (controlsWorld |> Seq.tryFind(fun c -> c.HitTest pw)) with
      | Some c -> c.OnMouseMove(e)
      | None -> ()

  override this.OnMouseUp e =
    let p = PointF(single e.X, single e.Y)
    let controlsView = controls |> Seq.filter (fun c -> c.CoordinateType = View)
    match (controlsView |> Seq.tryFind (fun c -> c.HitTest p)) with
    | Some c -> c.OnMouseUp(e)
    | None -> 
      let pw = transformPoint transform.V2W p
      let controlsWorld = controls |> Seq.filter (fun c -> c.CoordinateType = World)
      match (controlsWorld |> Seq.tryFind(fun c -> c.HitTest pw)) with
      | Some c -> c.OnMouseUp(e)
      | None -> ()

  override this.OnPaint e =
    let g = e.Graphics

    let t = g.Transform

    g.Transform <- transform.W2V

    for idx in (controls.Count - 1) .. -1 .. 0 do
      let c = controls.[idx]
      if c.CoordinateType = World then
        c.OnPaint e
    
    g.Transform <- t

    for idx in (controls.Count - 1) .. -1 .. 0 do
      let c = controls.[idx]
      if c.CoordinateType = View then
        c.OnPaint e

  override this.OnKeyDown e =
    match e.KeyCode with
    | _ -> ()

type PIButton() =
  inherit LWControl()

  let mutable text = ""
  let mutable innerColor = Color.DarkGray
  let mutable borderColor = Color.MidnightBlue

  let mutable borderWidth = 4.f
  member this.Text
    with get() = text
    and set(v) = text <- v
  
  member this.InnerColor 
    with get() = innerColor
    and set(c) = innerColor <- c

  member this.BorderColor 
    with get() = borderColor
    and set(c) = borderColor <- c

  member this.BorderWidth 
    with get() = borderWidth
    and set(b) = borderWidth <- b

  override this.OnPaint e =
    let parent = this.Parent
    let g = e.Graphics
    let ssz = g.MeasureString(text, parent.Font)
    let newH, newW = ssz.Height, ssz.Width
    match this.Size.Width >= newW, this.Size.Height >= newH with
      | true, true -> ()
      | false, false -> this.Size <- ssz
      | false, true -> this.Size <- SizeF(newW,this.Size.Height)
      | true, false -> this.Size <- SizeF(this.Size.Width,newH)   

    let r = RectangleF(this.Position, this.Size) |> RectF2Rect
    let p = new Pen(this.BorderColor)
    p.Width <- this.BorderWidth
    g.DrawRectangle(p, r)
    let b = new SolidBrush(this.InnerColor)
    g.FillRectangle(b, r)
    let pos = this.Position
    let sz = this.Size
    let sx, sy = pos.X + (sz.Width - ssz.Width) / 2.f, pos.Y + (sz.Height - ssz.Height) / 2.f
    g.DrawString(text, parent.Font, Brushes.White, PointF(sx, sy))
    
type RoundButton() =
  inherit LWControl()

  let mutable innerColor = Color.Blue 
  let mutable borderColor = Color.Black

  let mutable borderWidth = 4.f

  member this.InnerColor 
    with get() = innerColor
    and set(c) = innerColor <- c

  member this.BorderColor 
    with get() = borderColor
    and set(c) = borderColor <- c

  member this.BorderWidth 
    with get() = borderWidth
    and set(b) = borderWidth <- b

  override this.OnPaint e =
    let g = e.Graphics   
    let r = RectangleF(this.Position, this.Size) |> RectF2Rect
    let p = new Pen(this.BorderColor)
    p.Width <- this.BorderWidth
    g.DrawEllipse(p, r)
    let b = new SolidBrush(this.InnerColor)
    g.FillEllipse(b, r)

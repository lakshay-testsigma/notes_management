# Core AI & Machine Learning playbook

Guidance for the stage skills. Each `##` heading is read by one skill; keep the eight headings and their order.

## How this domain is learned

Core AI is how models work and are trained. Building products on finished models belongs to `ai-engineering`.

**Prerequisite chain.** A topic may assume everything above it.

1. Python and NumPy (arrays, broadcasting)
2. Math, only as needed: vectors and matrices, derivatives and the chain rule, probability and expectation
3. The learning setup: data, model, loss, optimisation, generalisation
4. Classical machine learning: linear and logistic regression, trees, clustering, evaluation
5. Neural networks: layers, activation, backpropagation, optimisers, regularisation
6. Architectures for data types: convolution for images, recurrence and attention for sequences
7. Transformers and language models
8. Generative models: autoencoders, GANs, diffusion
9. Reinforcement learning
10. Training at scale, evaluation, interpretability

**Beginner misconceptions to correct early.**

- "The math must come first." Teach each piece of math at the moment it explains something visible; a picture and ten lines of NumPy first, the formula second.
- "A neural network is like a brain." It is a differentiable function fitted by gradient descent.
- "Lower training loss means a better model." Generalisation is measured on data the model has not seen.
- "More layers and more data always help." Capacity, data quality, and regularisation interact (bias-variance, overfitting).
- "Accuracy is the metric." Class imbalance makes accuracy misleading; precision, recall, and calibration matter.
- "Backpropagation is a different algorithm from the chain rule." It is the chain rule applied efficiently, right to left.
- "Attention means the model understands." Attention is a learned weighted average over positions.
- "Deep learning replaced classical ML." Gradient-boosted trees still win on most tabular data.
- "The test set can be reused." Tuning on it leaks information and invalidates the estimate.

**Choosing depth.**

- `quick`: one component (softmax, dropout, cosine similarity, learning-rate warmup, a metric).
- `standard`: one algorithm or layer (logistic regression, k-means, convolution, self-attention, Adam, LoRA).
- `deep`: a pillar (backpropagation, the transformer, diffusion models, reinforcement learning basics).

**Cutting a topic into lesson pages.**

1. The task and why simpler methods fail
2. Intuition with a picture, no formulas
3. The mechanism on a tiny example with real numbers
4. The math, one equation tied to the picture
5. The code: from scratch in NumPy or minimal PyTorch
6. Training behaviour: what the loss curve looks like, what goes wrong
7. Where it sits in modern systems (paper digest and repo-intel)

## Trusted sources

**Official documentation (tier A candidates).** PyTorch (pytorch.org), scikit-learn user guide (scikit-learn.org), NumPy (numpy.org), JAX, Keras (keras.io), Hugging Face Transformers, Diffusers, and PEFT (huggingface.co/docs), Gymnasium (gymnasium.farama.org).

**Standard books.**

- *Deep Learning*, Ian Goodfellow, Yoshua Bengio, Aaron Courville (MIT Press, 2016; deeplearningbook.org)
- *Understanding Deep Learning*, Simon J. D. Prince (MIT Press, 2023; free online): the best modern beginner-to-intermediate text
- *Dive into Deep Learning*, Zhang, Lipton, Li, Smola (Cambridge University Press, 2023; d2l.ai): runnable code for every idea
- *Hands-On Machine Learning with Scikit-Learn and PyTorch*, Aurélien Géron (O'Reilly, 2025); earlier editions use Keras and TensorFlow
- *Deep Learning with Python*, François Chollet (Manning)
- *An Introduction to Statistical Learning*, James, Witten, Hastie, Tibshirani (Springer; free at statlearning.com; Python edition 2023)
- *The Elements of Statistical Learning*, Hastie, Tibshirani, Friedman (Springer, 2nd edition 2009)
- *Pattern Recognition and Machine Learning*, Christopher Bishop (Springer, 2006); *Deep Learning: Foundations and Concepts*, Bishop and Bishop (Springer, 2024)
- *Probabilistic Machine Learning: An Introduction*, Kevin P. Murphy (MIT Press, 2022)
- *Reinforcement Learning: An Introduction*, Richard Sutton and Andrew Barto (MIT Press, 2nd edition 2018; free online)
- *Mathematics for Machine Learning*, Deisenroth, Faisal, Ong (Cambridge University Press, 2020; free at mml-book.github.io)
- *Speech and Language Processing*, Dan Jurafsky and James H. Martin (3rd edition draft, free online)
- *Build a Large Language Model (From Scratch)*, Sebastian Raschka (Manning, 2024)

**Defining papers** (author list shortened; all are the paper that introduced the idea).

- Backpropagation: "Learning Representations by Back-propagating Errors", Rumelhart, Hinton, Williams, Nature, 1986
- CNNs: "Gradient-Based Learning Applied to Document Recognition", LeCun, Bottou, Bengio, Haffner, Proceedings of the IEEE, 1998
- AlexNet: "ImageNet Classification with Deep Convolutional Neural Networks", Krizhevsky, Sutskever, Hinton, NeurIPS 2012
- ResNet: "Deep Residual Learning for Image Recognition", He, Zhang, Ren, Sun, CVPR 2016
- LSTM: "Long Short-Term Memory", Hochreiter and Schmidhuber, Neural Computation, 1997
- word2vec: "Efficient Estimation of Word Representations in Vector Space", Mikolov et al., 2013
- Attention: "Neural Machine Translation by Jointly Learning to Align and Translate", Bahdanau, Cho, Bengio, ICLR 2015
- Transformer: "Attention Is All You Need", Vaswani et al., NeurIPS 2017
- BERT: Devlin et al., NAACL 2019; GPT-3: "Language Models are Few-Shot Learners", Brown et al., NeurIPS 2020
- Adam: Kingma and Ba, ICLR 2015; AdamW: "Decoupled Weight Decay Regularization", Loshchilov and Hutter, ICLR 2019
- Dropout: Srivastava et al., JMLR, 2014; Batch Normalization: Ioffe and Szegedy, ICML 2015; Layer Normalization: Ba, Kiros, Hinton, 2016
- GAN: "Generative Adversarial Nets", Goodfellow et al., NeurIPS 2014; VAE: "Auto-Encoding Variational Bayes", Kingma and Welling, ICLR 2014
- Diffusion: "Denoising Diffusion Probabilistic Models", Ho, Jain, Abbeel, NeurIPS 2020; "High-Resolution Image Synthesis with Latent Diffusion Models", Rombach et al., CVPR 2022
- Vision Transformer: "An Image is Worth 16x16 Words", Dosovitskiy et al., ICLR 2021; CLIP: Radford et al., ICML 2021
- Deep RL: "Human-level Control through Deep Reinforcement Learning", Mnih et al., Nature, 2015; "Mastering the Game of Go with Deep Neural Networks and Tree Search", Silver et al., Nature, 2016; "Proximal Policy Optimization Algorithms", Schulman et al., 2017
- Trees: "Random Forests", Leo Breiman, Machine Learning, 2001; "XGBoost: A Scalable Tree Boosting System", Chen and Guestrin, KDD 2016
- Scaling: "Scaling Laws for Neural Language Models", Kaplan et al., 2020
- Adaptation: "LoRA: Low-Rank Adaptation of Large Language Models", Hu et al., ICLR 2022
- Visualisation: "Visualizing Data using t-SNE", van der Maaten and Hinton, JMLR, 2008
- Review: "Deep Learning", LeCun, Bengio, Hinton, Nature, 2015
- Practice: "Hidden Technical Debt in Machine Learning Systems", Sculley et al., NeurIPS 2015

Top venues for the rubric: NeurIPS, ICML, ICLR, CVPR, ACL, EMNLP, JMLR, Nature, Science.

**Courses and explainers.**

- Andrej Karpathy, "Neural Networks: Zero to Hero" (video series with code)
- 3Blue1Brown, the neural networks and linear algebra series
- Stanford CS231n (vision), CS224N (NLP), CS229 (machine learning), CS336 (language modeling from scratch)
- fast.ai, Practical Deep Learning for Coders; Andrew Ng's Machine Learning Specialization (DeepLearning.AI)
- David Silver's reinforcement learning lectures; OpenAI Spinning Up in Deep RL
- "The Illustrated Transformer", Jay Alammar; "The Annotated Transformer", Harvard NLP
- Distill (distill.pub; archive of interactive articles); Chris Olah's blog (colah.github.io); Lilian Weng's blog
- "A Recipe for Training Neural Networks", Andrej Karpathy (2019); the Deep Learning Tuning Playbook (`google-research/tuning_playbook`; a finished document, cite it as a guide, not as a repo-intel target)

**Research labs whose work counts as tier A when widely adopted.** Google DeepMind and Google Research, OpenAI, Anthropic, Meta AI (FAIR), Microsoft Research, and university labs such as Stanford, Berkeley (BAIR), MIT, CMU, Toronto, and Mila.

**Flagship repositories for repo-intel.**

- Readable teaching implementations (best first targets): `karpathy/micrograd`, `karpathy/nanochat`, `rasbt/LLMs-from-scratch`; and the finished, no longer updated `karpathy/nanoGPT` and `karpathy/minGPT` (allowed under the rubric's frozen-reference rule)
- Frameworks (slice one module): `pytorch/pytorch`, `scikit-learn/scikit-learn`, `keras-team/keras`, `jax-ml/jax`, `tinygrad/tinygrad`
- Model libraries: `huggingface/transformers`, `huggingface/diffusers`, `huggingface/peft`, `huggingface/pytorch-image-models`, `pytorch/vision`
- Trees: `dmlc/xgboost`, `lightgbm-org/LightGBM`
- Reinforcement learning: `DLR-RM/stable-baselines3`, `Farama-Foundation/Gymnasium`
- Interpretability: `TransformerLensOrg/TransformerLens`
- Training tooling: `Lightning-AI/pytorch-lightning`, `mlflow/mlflow`

**Avoid.** Towards Data Science and Medium posts as primary sources; "ML in 5 minutes" videos; Kaggle notebooks copied without understanding; tutorials on TensorFlow 1.x or Python 2; blog explanations of a paper when the paper or an official annotated version is readable; arXiv preprints with no citations and no code; papers whose results were not reproduced; course-selling sites that rank themselves.

## Lesson recipes

| Kind of concept | Component | Concrete example |
|---|---|---|
| Embeddings, vectors, similarity | `VectorSpace3D` | Word vectors as points; "king − man + woman" drawn as arrows; nearest neighbours of a chosen word light up |
| Linear algebra and loss surfaces | `VectorSpace3D` | A matrix transforms a cloud of points as the learner edits its entries; a ball rolls down a loss surface under gradient descent |
| Network and computation graphs | `Graph3D` | A small multilayer perceptron with neurons as nodes and weights as edge thickness; `editable` to add a layer; activations light up for an input |
| Forward and backward pass | `FlowAnimation` | Values flow forward through a computation graph, then gradients flow backward with the chain rule shown on each edge |
| Data and training pipelines | `FlowAnimation` | Batch → forward → loss → backward → optimiser step → repeat; tokens flow through a transformer block |
| Hyperparameters | `ParamPlayground` | Learning-rate slider: converge, oscillate, diverge on a 2D loss; `k` in k-means; temperature on a softmax; regularisation strength against a fitted curve |
| Training curves and metrics | `Chart` | Train versus validation loss showing overfitting; a precision-recall curve; a confusion matrix; an attention heat map |
| From-scratch code | `CodeWalkthrough` | Backprop for one neuron in NumPy; scaled dot-product attention in 15 lines; a training loop in PyTorch |
| Algorithms with states | `StateMachine` | An agent in a grid-world Markov decision process: states, actions, rewards |
| Architecture overview | `SystemDiagram` | Transformer block: embedding, attention, MLP, residual, normalisation; encoder versus decoder |
| Field history | `Timeline` | Perceptron → backprop → AlexNet → ResNet → Transformer → diffusion |
| Static structure | `Mermaid` | A decision tree; tensor shapes through a network |

**Activities.**

- `PredictReveal`: "The learning rate is multiplied by 10: what does the loss curve do?" "Which of these two points will k-means assign to the red cluster?"
- `OrderSteps`: order one training step; order the operations inside self-attention
- `MatchPairs`: symptom (train loss low, validation high) to cause; loss function to task; layer to what it does
- `Quiz`: choose the metric for an imbalanced problem; choose the model family for a dataset

**3D versus 2D.** This domain gains the most from 3D: vector spaces, embeddings, loss landscapes, and network graphs are spatial by nature. Always say when a 3D picture is a projection of a higher-dimensional space. Use 2D `Chart` for curves and metrics, and `CodeWalkthrough` for the from-scratch code; tensor-shape bookkeeping is clearer as a flat diagram.

**Custom simulation ideas.** A neural-network playground on 2D data where the decision boundary updates live; a gradient-descent ball with momentum and Adam side by side; a convolution kernel sliding over an image with editable kernel values; an attention matrix the learner can hover to see which tokens attend to which; a diffusion process that adds and removes noise step by step; a k-means stepper; a tiny bigram language model that generates text as the learner changes temperature.

## Mini project patterns

Everything trains on a laptop CPU in minutes, with a fixed random seed. Guided → independent.

1. **Implement it from scratch in NumPy** (guided, 1–2 h): linear regression, logistic regression, or a two-layer network with hand-written gradients, checked against a library. Proves: the mechanism. Real use: debugging real models.
2. **Reproduce a classic result small** (guided, 2 h): MNIST or Fashion-MNIST classifier in PyTorch above a stated accuracy, with a loss curve. Proves: the training loop. Real use: every later project.
3. **Tabular model with honest evaluation** (semi-guided, 2 h): predict a public dataset target with a baseline, a tree model, proper splits, and the right metric. Proves: evaluation and leakage avoidance. Real use: churn and risk scoring.
4. **Diagnose and fix training** (semi-guided, 2 h): a starter that overfits, diverges, or has a subtle bug; fix it using curves. Proves: reading training behaviour. Real use: daily ML work.
5. **Build the component, then use the library** (semi-guided, 2–3 h): write self-attention or a convolution layer, test it against `torch.nn`, then train a tiny model with it. Proves: understanding of the layer. Real use: reading model code.
6. **Tiny language model** (independent, 3 h): a character-level transformer on Tiny Shakespeare that generates text. Proves: tokens, attention, sampling. Real use: understanding LLMs.
7. **Fine-tune a small pretrained model** (independent, 2–3 h): adapt a small model to a classification task with and without LoRA and compare. Proves: transfer learning. Real use: domain adaptation.
8. **Ablation study** (independent, 2 h): change one thing (optimizer, normalisation, depth), run three seeds, report a table with variance. Proves: experimental method. Real use: research and model selection.

Tests check shapes, gradient correctness against numerical gradients, determinism under a seed, and a minimum metric.

## Repository analysis focus

| What to find | Where it usually lives |
|---|---|
| Model definition | `model.py`, `models/`, `modeling_*.py`, layer and block classes |
| Training loop | `train.py`, `trainer.py`, `engine.py`, optimizer and scheduler setup |
| Data pipeline | `data/`, `datasets/`, tokenizers, augmentation, collate functions, dataloaders |
| Configuration and reproducibility | config files (YAML, dataclasses, Hydra), seeds, argument parsing |
| Numerical and performance techniques | mixed precision, gradient clipping and accumulation, compilation, caching, initialisation |
| Evaluation | `eval.py`, metrics modules, benchmark scripts |
| Checkpointing and export | save and load code, weight formats (safetensors), export to ONNX |
| Distributed and hardware handling | device placement, multi-GPU code, memory management |
| Testing strategy | unit tests for layers, shape and gradient checks, small-model regression tests, tolerance comparisons |
| API design | base classes, registries, how new models or layers plug in |
| Documentation of decisions | paper references in docstrings, model cards, `docs/` |
| CI | workflows, hardware matrices, slow-test markers |

**External technologies to record as `_tech` notes.** Framework and version, CUDA and accelerator libraries, dataset hubs, tokenizer libraries, experiment trackers (Weights & Biases, MLflow, TensorBoard), weight formats, compute platforms.

**Findings worth ranking high.** Every place the code differs from the paper (pre-normalisation, initialisation, learning-rate schedule, weight tying), the numerical-stability tricks, and how correctness is tested when outputs are floating-point.

## Capstone shape

The capstone is a trained model with a reproducible pipeline and an honest report, small enough for a laptop.

**Production ready means.**

- One command reproduces training from raw data to metrics, with fixed seeds
- Data, model, training, and evaluation are separate modules; configuration in one file
- A baseline is reported next to the model; metrics on a held-out test set touched once
- Tests for data transforms, layer shapes, gradient checks, and overfitting a single batch
- Training logs and curves saved; checkpoints versioned
- A model card in the README: data, intended use, metrics, limits, known failure cases
- An inference entry point (CLI or small API) with input validation
- `ARCHITECTURE.md` and ADRs for the main choices (architecture, loss, metric)

**Recommended structure.**

```
src/
  data/        Dataset classes, transforms, DataModule
  models/      nn.Module classes, one per file
  training/    Trainer class, optimizer and scheduler factories, callbacks
  evaluation/  Metric classes, Evaluator
  inference/   Predictor class, CLI or API
  config.py    dataclass configuration
scripts/       train.py, evaluate.py, predict.py
tests/
```

**Where OOP and SOLID fit.** Models are classes by framework design (`nn.Module`); a `Trainer`, `Evaluator`, and `Dataset` each with one job fit naturally, and injecting the model, data, and optimizer into the `Trainer` keeps experiments swappable. Keep the math itself (loss functions, metrics, transforms) as pure functions on tensors; do not wrap arithmetic in class hierarchies. Notebooks are for exploration only; the capstone is importable modules.

**Example capstones.**

- Handwritten-digit recognizer served through a small web page with a drawing canvas
- Character-level GPT trained on a public-domain text with a sampling CLI
- Spam or sentiment classifier comparing a bag-of-words baseline with a small transformer
- Tabular predictor (public housing or churn dataset) with gradient boosting, calibration, and an error analysis
- Grid-world or CartPole agent trained with a from-scratch policy-gradient method

## Recall focus

Worth remembering a year later:

- Mechanisms in one or two sentences: backpropagation, attention, convolution, diffusion, gradient boosting
- Decision rules: which model family for which data; which metric for which problem; when to regularise; when more data beats a bigger model
- Diagnosis: what each loss-curve shape means and the first fix to try
- Trade-offs: bias versus variance, batch size versus noise, depth versus trainability
- Tensor shapes through a transformer block; the one-sentence contribution of each defining paper

Question styles: Explain ("why do residual connections help deep networks train?"), Compare ("batch norm versus layer norm"), Debug ("training loss falls, validation loss rises after epoch 5; what is happening and two fixes?"), Decide ("10,000 rows of tabular data: which model first and why?"). Include a few "compute by hand" cards with tiny numbers (one softmax, one gradient step).

## Safety and ethics

- Use public datasets with clear licenses; record the license and source. No scraped personal data.
- State dataset bias and model limits in the model card; do not present a toy model as fit for real decisions about people.
- Keep compute small: CPU-sized runs with the expected time in the README; no paid GPU usage unless the learner asks.
- Report results honestly: same test set for all variants, no tuning on the test set, variance across seeds where it matters.
